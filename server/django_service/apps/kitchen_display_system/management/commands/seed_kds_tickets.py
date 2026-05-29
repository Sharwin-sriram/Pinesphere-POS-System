"""
Management command: seed_kds_tickets
Creates realistic KDS test tickets tied to existing kitchens and orders.
Usage: python manage.py seed_kds_tickets
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
import random
import uuid

from apps.kitchen_display_system.models import Kitchen, KitchenOrderTicket
from apps.orders.models import Order


SAMPLE_ITEMS = [
    ['Butter Chicken', 'Naan Bread'],
    ['Masala Dosa', 'Coconut Chutney', 'Sambar'],
    ['Margherita Pizza'],
    ['Chicken Biryani', 'Raita'],
    ['Paneer Tikka', 'Mint Chutney'],
    ['Caesar Salad', 'Garlic Bread'],
    ['Lamb Rogan Josh', 'Steamed Rice'],
    ['Veg Fried Rice', 'Spring Rolls'],
    ['Mushroom Risotto'],
    ['Fish and Chips'],
]

ALLERGY_SETS = [
    [],
    [],
    [],
    ['Nuts'],
    ['Gluten'],
    ['Dairy', 'Gluten'],
    ['Shellfish'],
    ['Eggs'],
]

COURSES = ['starter', 'main', 'side', 'dessert']
ORDER_TYPES = ['dine_in', 'dine_in', 'dine_in', 'takeaway', 'delivery']
STATUSES = ['pending', 'pending', 'pending', 'printed', 'recalled']


class Command(BaseCommand):
    help = 'Seed realistic KDS test tickets for all active kitchens'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=12,
            help='Number of tickets to create per kitchen (default: 12)',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Remove existing pending/printed tickets before seeding',
        )

    def handle(self, *args, **options):
        kitchens = Kitchen.objects.filter(is_active=True)
        if not kitchens.exists():
            self.stdout.write(self.style.WARNING('No active kitchens found. Create a kitchen first.'))
            return

        orders = list(Order.objects.all()[:50])
        if not orders:
            self.stdout.write(self.style.WARNING('No orders found. Create some orders first.'))
            return

        if options['clear']:
            deleted, _ = KitchenOrderTicket.objects.filter(
                status__in=['pending', 'printed']
            ).delete()
            self.stdout.write(self.style.WARNING(f'Cleared {deleted} existing tickets.'))

        count = options['count']
        created_total = 0

        for kitchen in kitchens:
            for i in range(count):
                order = random.choice(orders)
                items_names = random.choice(SAMPLE_ITEMS)
                allergy_flags = random.choice(ALLERGY_SETS)
                offset_minutes = random.randint(1, 20)
                created_time = timezone.now() - timedelta(minutes=offset_minutes)
                status = random.choice(STATUSES)

                kot_number = f'KOT-{uuid.uuid4().hex[:8].upper()}'

                ticket = KitchenOrderTicket(
                    order=order,
                    kitchen=kitchen,
                    kot_number=kot_number,
                    status=status,
                    course=random.choice(COURSES),
                    order_type=random.choice(ORDER_TYPES),
                    allergy_flags=allergy_flags,
                    hold=False,
                    special_instructions=random.choice([
                        '', '', '', 'Extra spicy', 'No onions', 'Well done',
                    ]),
                )
                ticket.save()
                # Set created_at retroactively for realistic age spread
                KitchenOrderTicket.objects.filter(pk=ticket.pk).update(
                    created_at=created_time
                )
                created_total += 1

            self.stdout.write(
                self.style.SUCCESS(f'  Kitchen "{kitchen.name}": {count} tickets created.')
            )

        self.stdout.write(self.style.SUCCESS(f'\nTotal tickets seeded: {created_total}'))
