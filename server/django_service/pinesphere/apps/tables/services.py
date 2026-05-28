from django.utils import timezone
from django.db import transaction
from pinesphere.core.exceptions import ServiceError
from .models import Table, TableMerge, TableStatusHistory, Reservation, Floor


def update_table_status(table: Table, status: str, updated_by=None, order=None):
    if status not in dict(Table.STATUSES):
        raise ServiceError('invalid_status', 'Invalid table status')
    table.status = status
    table.current_order = order
    table.save()
    TableStatusHistory.objects.create(table=table, status=status, changed_by=updated_by, order=order)
    return table


@transaction.atomic
def merge_tables(table_ids, target_table_id, merged_by=None, notes=None):
    tables = Table.objects.filter(id__in=table_ids, deleted_at__isnull=True)
    if not tables.exists():
        raise ServiceError('tables_not_found', 'No tables found to merge')
    try:
        target = Table.objects.get(id=target_table_id, deleted_at__isnull=True)
    except Table.DoesNotExist:
        raise ServiceError('target_table_not_found', 'Target table not found')

    tm = TableMerge.objects.create(target_table=target, merged_by=merged_by, notes=notes)
    for t in tables:
        if t.id == target.id:
            continue
        t.is_merged = True
        t.merged_into = target
        t.save()
        tm.source_tables.add(t)

    tm.save()
    return target


@transaction.atomic
def split_table(table_id, new_table_data: list, split_by=None):
    try:
        table = Table.objects.get(id=table_id, deleted_at__isnull=True)
    except Table.DoesNotExist:
        raise ServiceError('table_not_found', 'Table not found')

    # Create new tables from provided data and mark original as not merged
    created = []
    for nd in new_table_data:
        t = Table.objects.create(
            restaurant=table.restaurant,
            branch=table.branch,
            floor=table.floor,
            name=nd.get('name'),
            capacity=nd.get('capacity', 1),
            metadata=nd.get('metadata'),
        )
        created.append(t)

    table.is_merged = False
    table.merged_into = None
    table.save()
    return created


def get_live_floor(branch_id):
    tables = Table.objects.filter(branch_id=branch_id, deleted_at__isnull=True)
    return list(tables.values('id', 'name', 'status', 'current_order', 'capacity', 'metadata'))
