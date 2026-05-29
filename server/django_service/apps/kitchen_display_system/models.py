from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator
import uuid


class KitchenDisplaySystem(models.Model):
    """Main Kitchen Display System configuration for a restaurant"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.OneToOneField(
        'authentication.Restaurant',
        on_delete=models.CASCADE,
        related_name='kitchen_display_system'
    )
    branch = models.ForeignKey(
        'authentication.Branch',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='kds_systems'
    )
    is_active = models.BooleanField(default=True)
    enable_sound_alerts = models.BooleanField(default=True)
    enable_ready_alerts = models.BooleanField(default=True)
    auto_kot_printing = models.BooleanField(default=True)
    preparation_time_default = models.IntegerField(default=15, help_text="Default preparation time in minutes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kds_kitchen_display_system'
        verbose_name = 'Kitchen Display System'
        verbose_name_plural = 'Kitchen Display Systems'

    def __str__(self):
        return f"KDS - {self.restaurant.name}"


class Kitchen(models.Model):
    """Represents a kitchen in the restaurant"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kds = models.ForeignKey(
        KitchenDisplaySystem,
        on_delete=models.CASCADE,
        related_name='kitchens'
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    kitchen_type_choices = [
        ('main', 'Main Kitchen'),
        ('prep', 'Prep Kitchen'),
        ('dessert', 'Dessert Kitchen'),
        ('bar', 'Bar'),
        ('custom', 'Custom'),
    ]
    kitchen_type = models.CharField(
        max_length=20,
        choices=kitchen_type_choices,
        default='main'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kds_kitchen'
        verbose_name = 'Kitchen'
        verbose_name_plural = 'Kitchens'
        unique_together = ('kds', 'name')

    def __str__(self):
        return f"{self.name} - {self.get_kitchen_type_display()}"


class KitchenDepartment(models.Model):
    """Departments within a kitchen (e.g., Grill, Fry, etc.)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kitchen = models.ForeignKey(
        Kitchen,
        on_delete=models.CASCADE,
        related_name='departments'
    )
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    display_order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kds_kitchen_department'
        verbose_name = 'Kitchen Department'
        verbose_name_plural = 'Kitchen Departments'
        ordering = ['display_order']
        unique_together = ('kitchen', 'name')

    def __str__(self):
        return f"{self.name} - {self.kitchen.name}"


class KitchenOrderStatus(models.Model):
    """Status of orders in the kitchen"""
    STATUS_CHOICES = [
        ('new', 'New'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('served', 'Served'),
        ('delayed', 'Delayed'),
        ('cancelled', 'Cancelled'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='kitchen_status_history'
    )
    kitchen = models.ForeignKey(
        Kitchen,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )
    department = models.ForeignKey(
        KitchenDepartment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='new'
    )
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    estimated_ready_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kds_kitchen_order_status'
        verbose_name = 'Kitchen Order Status'
        verbose_name_plural = 'Kitchen Order Status'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order.id} - {self.get_status_display()}"


class KitchenOrderTicket(models.Model):
    """Kitchen Order Ticket (KOT) - represents what needs to be prepared"""
    KOT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('printed', 'Printed'),
        ('reprinted', 'Reprinted'),
        ('cancelled', 'Cancelled'),
        # KDS lifecycle statuses
        ('bumped', 'Bumped'),
        ('recalled', 'Recalled'),
        ('held', 'Held'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='kots'
    )
    kitchen = models.ForeignKey(
        Kitchen,
        on_delete=models.CASCADE,
        related_name='kots'
    )
    department = models.ForeignKey(
        KitchenDepartment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    kot_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(
        max_length=20,
        choices=KOT_STATUS_CHOICES,
        default='pending'
    )
    items = models.ManyToManyField(
        'orders.OrderItem',
        related_name='kots'
    )
    print_count = models.IntegerField(default=0)
    last_printed_at = models.DateTimeField(null=True, blank=True)
    special_instructions = models.TextField(blank=True, null=True)
    # KDS operational fields
    bumped_at = models.DateTimeField(null=True, blank=True)
    bumped_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bumped_kots',
    )
    recalled_at = models.DateTimeField(null=True, blank=True)
    hold = models.BooleanField(default=False)
    allergy_flags = models.JSONField(default=list, blank=True)
    order_type = models.CharField(
        max_length=20,
        choices=[
            ('dine_in', 'Dine In'),
            ('takeaway', 'Takeaway'),
            ('delivery', 'Delivery'),
        ],
        default='dine_in',
    )
    course = models.CharField(
        max_length=20,
        choices=[
            ('starter', 'Starter'),
            ('main', 'Main'),
            ('side', 'Side'),
            ('dessert', 'Dessert'),
        ],
        default='main',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kds_kitchen_order_ticket'
        verbose_name = 'Kitchen Order Ticket'
        verbose_name_plural = 'Kitchen Order Tickets'
        ordering = ['-created_at']

    def __str__(self):
        return f"KOT-{self.kot_number}"


class PreparationTimer(models.Model):
    """Tracks preparation time for orders"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='preparation_timers'
    )
    kitchen_status = models.ForeignKey(
        KitchenOrderStatus,
        on_delete=models.CASCADE,
        related_name='timers'
    )
    estimated_duration = models.IntegerField(
        default=15,
        validators=[MinValueValidator(1)],
        help_text="Estimated duration in minutes"
    )
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_running = models.BooleanField(default=True)

    class Meta:
        db_table = 'kds_preparation_timer'
        verbose_name = 'Preparation Timer'
        verbose_name_plural = 'Preparation Timers'

    def __str__(self):
        return f"Timer - Order {self.order.id}"

    @property
    def elapsed_time(self):
        """Returns elapsed time in minutes"""
        end_time = self.completed_at or timezone.now()
        delta = end_time - self.started_at
        return int(delta.total_seconds() / 60)

    @property
    def remaining_time(self):
        """Returns remaining time in minutes"""
        if not self.is_running or self.completed_at:
            return 0
        remaining = self.estimated_duration - self.elapsed_time
        return max(0, remaining)

    @property
    def is_delayed(self):
        """Check if order is delayed"""
        return self.elapsed_time > self.estimated_duration


class PrinterConfiguration(models.Model):
    """Configuration for KOT printers"""
    PRINTER_TYPE_CHOICES = [
        ('thermal', 'Thermal Printer'),
        ('inkjet', 'Inkjet Printer'),
        ('laser', 'Laser Printer'),
    ]

    CONNECTION_TYPE_CHOICES = [
        ('usb', 'USB'),
        ('bluetooth', 'Bluetooth'),
        ('lan', 'LAN'),
        ('wifi', 'WiFi'),
        ('serial', 'Serial'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kds = models.ForeignKey(
        KitchenDisplaySystem,
        on_delete=models.CASCADE,
        related_name='printers'
    )
    department = models.ForeignKey(
        KitchenDepartment,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    name = models.CharField(max_length=100)
    label = models.CharField(max_length=120, blank=True, default="")
    printer_type = models.CharField(
        max_length=20,
        choices=PRINTER_TYPE_CHOICES,
        default='thermal'
    )
    connection_type = models.CharField(
        max_length=20,
        choices=CONNECTION_TYPE_CHOICES,
        default='usb'
    )
    printer_address = models.CharField(max_length=255, help_text="IP address or device address")
    port_number = models.IntegerField(default=9100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_default = models.BooleanField(default=False)
    paper_width = models.IntegerField(default=80, help_text="Paper width in mm")
    paper_size = models.CharField(max_length=20, blank=True, default="80mm")
    encoding = models.CharField(max_length=32, blank=True, default="UTF-8")
    auto_cut = models.BooleanField(default=True)
    cash_drawer_enabled = models.BooleanField(default=False)
    assigned_order_types = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kds_printer_configuration'
        verbose_name = 'Printer Configuration'
        verbose_name_plural = 'Printer Configurations'

    def __str__(self):
        return f"{self.name} ({self.get_printer_type_display()})"


class KdsStation(models.Model):
    """Kitchen display station definitions."""

    STATION_TYPE_CHOICES = [
        ('PREP', 'Prep'),
        ('EXPO', 'Expo'),
        ('BAR', 'Bar'),
        ('PASS', 'Pass'),
    ]

    LAYOUT_CHOICES = [
        ('grid', 'Grid'),
        ('list', 'List'),
        ('ticket', 'Ticket'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    restaurant = models.ForeignKey(
        'authentication.Restaurant',
        on_delete=models.CASCADE,
        related_name='kds_stations'
    )
    name = models.CharField(max_length=100)
    label = models.CharField(max_length=120, blank=True, default="")
    color = models.CharField(max_length=32, blank=True, default="slate")
    type = models.CharField(max_length=8, choices=STATION_TYPE_CHOICES, default='PREP')
    printer = models.ForeignKey(
        PrinterConfiguration,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='stations'
    )
    alert_seconds = models.PositiveIntegerField(default=300)
    critical_seconds = models.PositiveIntegerField(default=600)
    sound_enabled = models.BooleanField(default=True)
    layout = models.CharField(max_length=16, choices=LAYOUT_CHOICES, default='grid')
    menu_category_ids = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kds_station'
        verbose_name = 'KDS Station'
        verbose_name_plural = 'KDS Stations'
        unique_together = ('restaurant', 'name')

    def __str__(self):
        return f"{self.restaurant.name} - {self.name}"


class KOTPrintLog(models.Model):
    """Log of all KOT prints"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kot = models.ForeignKey(
        KitchenOrderTicket,
        on_delete=models.CASCADE,
        related_name='print_logs'
    )
    printer = models.ForeignKey(
        PrinterConfiguration,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    printed_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    print_type_choices = [
        ('initial', 'Initial Print'),
        ('reprint', 'Reprint'),
    ]
    print_type = models.CharField(
        max_length=20,
        choices=print_type_choices,
        default='initial'
    )
    status_choices = [
        ('success', 'Success'),
        ('failed', 'Failed'),
        ('pending', 'Pending'),
    ]
    status = models.CharField(
        max_length=20,
        choices=status_choices,
        default='pending'
    )
    error_message = models.TextField(blank=True, null=True)
    printed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'kds_kot_print_log'
        verbose_name = 'KOT Print Log'
        verbose_name_plural = 'KOT Print Logs'
        ordering = ['-printed_at']

    def __str__(self):
        return f"Print Log - KOT {self.kot.kot_number}"


class OrderPriority(models.Model):
    """Define priority levels for orders"""
    PRIORITY_CHOICES = [
        (1, 'Low'),
        (2, 'Normal'),
        (3, 'High'),
        (4, 'Urgent'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.OneToOneField(
        'orders.Order',
        on_delete=models.CASCADE,
        related_name='kitchen_priority'
    )
    priority = models.IntegerField(
        choices=PRIORITY_CHOICES,
        default=2
    )
    reason = models.CharField(max_length=255, blank=True, null=True)
    set_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'kds_order_priority'
        verbose_name = 'Order Priority'
        verbose_name_plural = 'Order Priorities'

    def __str__(self):
        return f"Order {self.order.id} - Priority {self.get_priority_display()}"


class KitchenAlert(models.Model):
    """Alerts generated in the kitchen (ready items, delays, etc.)"""
    ALERT_TYPE_CHOICES = [
        ('ready', 'Item Ready'),
        ('delay', 'Order Delayed'),
        ('new_order', 'New Order'),
        ('custom', 'Custom Alert'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kitchen = models.ForeignKey(
        Kitchen,
        on_delete=models.CASCADE,
        related_name='alerts'
    )
    order = models.ForeignKey(
        'orders.Order',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='kitchen_alerts'
    )
    alert_type = models.CharField(
        max_length=20,
        choices=ALERT_TYPE_CHOICES,
        default='custom'
    )
    message = models.TextField()
    is_acknowledged = models.BooleanField(default=False)
    acknowledged_by = models.ForeignKey(
        'authentication.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='acknowledged_alerts'
    )
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'kds_kitchen_alert'
        verbose_name = 'Kitchen Alert'
        verbose_name_plural = 'Kitchen Alerts'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.message}"
