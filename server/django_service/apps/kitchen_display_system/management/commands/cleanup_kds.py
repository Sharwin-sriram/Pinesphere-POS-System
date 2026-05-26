"""
Management command to cleanup kitchen display system data
Usage: python manage.py cleanup_kds
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.kitchen_display_system.models import KitchenAlert, KOTPrintLog
from apps.kitchen_display_system.services.alert_service import AlertService
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Cleanup expired alerts and old print logs'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=7,
            help='Delete records older than this many days (default: 7)'
        )
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting'
        )

    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        cutoff_date = timezone.now() - timedelta(days=days)

        self.stdout.write(self.style.SUCCESS('Kitchen Display System Cleanup'))
        self.stdout.write('=' * 50)

        # Cleanup expired alerts
        self.cleanup_expired_alerts(dry_run)

        # Cleanup old print logs
        self.cleanup_old_print_logs(cutoff_date, dry_run)

        self.stdout.write(self.style.SUCCESS('\n✓ Cleanup completed successfully!'))

    def cleanup_expired_alerts(self, dry_run=False):
        """Cleanup expired alerts"""
        self.stdout.write('\nCleaning up expired alerts...')
        
        deleted_count = AlertService.cleanup_expired_alerts() if not dry_run else 0
        
        if dry_run:
            expired_alerts = KitchenAlert.objects.filter(
                expires_at__lt=timezone.now()
            )
            deleted_count = expired_alerts.count()
            self.stdout.write(f'  Would delete: {deleted_count} expired alerts')
        else:
            self.stdout.write(self.style.SUCCESS(f'  ✓ Deleted: {deleted_count} expired alerts'))

    def cleanup_old_print_logs(self, cutoff_date, dry_run=False):
        """Cleanup old print logs"""
        self.stdout.write('\nCleaning up old print logs...')
        
        old_logs = KOTPrintLog.objects.filter(printed_at__lt=cutoff_date)
        deleted_count = old_logs.count()
        
        if dry_run:
            self.stdout.write(f'  Would delete: {deleted_count} print logs older than {cutoff_date.date()}')
        else:
            old_logs.delete()
            self.stdout.write(self.style.SUCCESS(f'  ✓ Deleted: {deleted_count} print logs'))
