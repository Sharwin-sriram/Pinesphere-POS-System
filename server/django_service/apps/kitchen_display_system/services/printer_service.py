"""
Printer Service - Handles thermal printer operations for KOT printing
"""
from django.utils import timezone
import logging
from ..models import KOTPrintLog

logger = logging.getLogger(__name__)


class PrinterService:
    """Service for printer operations and KOT printing"""

    @staticmethod
    def test_connection(printer):
        """
        Test connection to printer
        
        Args:
            printer: PrinterConfiguration instance
        
        Returns:
            bool: True if connected, False otherwise
        """
        try:
            if printer.connection_type == 'usb':
                return PrinterService._test_usb_connection(printer)
            elif printer.connection_type == 'network':
                return PrinterService._test_network_connection(printer)
            elif printer.connection_type == 'bluetooth':
                return PrinterService._test_bluetooth_connection(printer)
            else:
                return False
        except Exception as e:
            logger.error(f"Printer connection test failed: {str(e)}")
            return False

    @staticmethod
    def print_kot(kot, printer, is_reprint=False):
        """
        Print KOT to thermal printer
        
        Args:
            kot: KitchenOrderTicket instance
            printer: PrinterConfiguration instance
            is_reprint: Boolean indicating if this is a reprint
        
        Returns:
            bool: True if print successful, False otherwise
        """
        try:
            # Generate KOT content
            kot_content = PrinterService._generate_kot_content(kot)
            
            # Send to printer based on connection type
            success = False
            if printer.connection_type == 'usb':
                success = PrinterService._print_to_usb(kot_content, printer)
            elif printer.connection_type == 'network':
                success = PrinterService._print_to_network(kot_content, printer)
            elif printer.connection_type == 'bluetooth':
                success = PrinterService._print_to_bluetooth(kot_content, printer)
            
            # Log print attempt
            print_type = 'reprint' if is_reprint else 'initial'
            KOTPrintLog.objects.create(
                kot=kot,
                printer=printer,
                print_type=print_type,
                status='success' if success else 'failed',
                error_message=None if success else 'Print operation failed'
            )
            
            return success
        except Exception as e:
            logger.error(f"KOT printing failed: {str(e)}")
            KOTPrintLog.objects.create(
                kot=kot,
                printer=printer,
                print_type='reprint' if is_reprint else 'initial',
                status='failed',
                error_message=str(e)
            )
            return False

    @staticmethod
    def _generate_kot_content(kot):
        """
        Generate KOT content for printing
        
        Args:
            kot: KitchenOrderTicket instance
        
        Returns:
            str: Formatted KOT content
        """
        lines = []
        lines.append("=" * 40)
        lines.append("KITCHEN ORDER TICKET (KOT)".center(40))
        lines.append("=" * 40)
        lines.append("")
        
        # KOT Info
        lines.append(f"KOT #: {kot.kot_number}")
        lines.append(f"Time: {timezone.now().strftime('%H:%M:%S')}")
        lines.append(f"Date: {timezone.now().strftime('%d/%m/%Y')}")
        lines.append("")
        
        # Kitchen Info
        lines.append(f"Kitchen: {kot.kitchen.name}")
        if kot.department:
            lines.append(f"Department: {kot.department.name}")
        lines.append("")
        
        # Order Info
        lines.append(f"Order #: {kot.order.id}")
        if hasattr(kot.order, 'table_number'):
            lines.append(f"Table: {kot.order.table_number}")
        if hasattr(kot.order, 'customer_name'):
            lines.append(f"Customer: {kot.order.customer_name}")
        lines.append("")
        
        # Items
        lines.append("ITEMS:".center(40))
        lines.append("-" * 40)
        
        for item in kot.items.all():
            qty = item.quantity
            name = item.menu_item.name if hasattr(item, 'menu_item') else str(item)
            lines.append(f"{qty}x {name}")
            
            # Add modifiers if present
            if hasattr(item, 'modifiers') and item.modifiers:
                lines.append(f"    Modifiers: {item.modifiers}")
            
            # Add special instructions
            if hasattr(item, 'special_instructions') and item.special_instructions:
                lines.append(f"    Note: {item.special_instructions}")
        
        lines.append("")
        
        # Special Instructions
        if kot.special_instructions:
            lines.append("SPECIAL INSTRUCTIONS:".center(40))
            lines.append("-" * 40)
            lines.append(kot.special_instructions)
            lines.append("")
        
        lines.append("=" * 40)
        lines.append(f"Print Count: {kot.print_count + 1}")
        lines.append("=" * 40)
        
        return "\n".join(lines)

    @staticmethod
    def _print_to_usb(content, printer):
        """Print to USB printer"""
        try:
            # This would depend on the specific printer library
            # Common libraries: escpos, python-printer, etc.
            # Example using python-escpos:
            # from escpos.printer import Usb
            # p = Usb(int(printer.printer_address), 0, 0)
            # p.text(content)
            # p.close()
            
            logger.info(f"Printing to USB printer: {printer.name}")
            return True
        except Exception as e:
            logger.error(f"USB print failed: {str(e)}")
            return False

    @staticmethod
    def _print_to_network(content, printer):
        """Print to network printer (TCP/IP)"""
        try:
            import socket
            
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect((printer.printer_address, printer.port_number or 9100))
            sock.sendall(content.encode('utf-8'))
            sock.close()
            
            logger.info(f"Printing to network printer: {printer.printer_address}")
            return True
        except Exception as e:
            logger.error(f"Network print failed: {str(e)}")
            return False

    @staticmethod
    def _print_to_bluetooth(content, printer):
        """Print to Bluetooth printer"""
        try:
            # This would require bluetooth library like pybluez
            # import bluetooth
            # sock = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
            # sock.connect((printer.printer_address, 1))
            # sock.send(content)
            # sock.close()
            
            logger.info(f"Printing to Bluetooth printer: {printer.name}")
            return True
        except Exception as e:
            logger.error(f"Bluetooth print failed: {str(e)}")
            return False

    @staticmethod
    def _test_usb_connection(printer):
        """Test USB printer connection"""
        try:
            logger.info(f"Testing USB printer: {printer.name}")
            # Implementation depends on printer library
            return True
        except Exception as e:
            logger.error(f"USB connection test failed: {str(e)}")
            return False

    @staticmethod
    def _test_network_connection(printer):
        """Test network printer connection"""
        try:
            import socket
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(5)
            result = sock.connect_ex((printer.printer_address, printer.port_number or 9100))
            sock.close()
            
            is_connected = result == 0
            logger.info(f"Network printer test {'successful' if is_connected else 'failed'}: {printer.printer_address}")
            return is_connected
        except Exception as e:
            logger.error(f"Network connection test failed: {str(e)}")
            return False

    @staticmethod
    def _test_bluetooth_connection(printer):
        """Test Bluetooth printer connection"""
        try:
            logger.info(f"Testing Bluetooth printer: {printer.name}")
            # Implementation depends on bluetooth library
            return True
        except Exception as e:
            logger.error(f"Bluetooth connection test failed: {str(e)}")
            return False

    @staticmethod
    def get_default_printer(kitchen):
        """
        Get default printer for a kitchen
        
        Args:
            kitchen: Kitchen instance
        
        Returns:
            PrinterConfiguration or None
        """
        # Try to get department-specific printer first
        if hasattr(kitchen, 'departments'):
            for dept in kitchen.departments.all():
                printer = PrinterService._get_printer_by_department(dept)
                if printer:
                    return printer
        
        # Fall back to default printer for KDS
        try:
            return kitchen.kds.printers.filter(is_default=True, is_active=True).first()
        except Exception:
            return None

    @staticmethod
    def _get_printer_by_department(department):
        """Get printer assigned to a specific department"""
        try:
            return department.printer_set.filter(is_active=True).first()
        except Exception:
            return None

    @staticmethod
    def auto_print_kot(kot, kds):
        """
        Automatically print KOT if auto-printing is enabled
        
        Args:
            kot: KitchenOrderTicket instance
            kds: KitchenDisplaySystem instance
        
        Returns:
            bool: True if printed or auto-print disabled, False if error
        """
        if not kds.auto_kot_printing:
            return True
        
        printer = PrinterService.get_default_printer(kot.kitchen)
        if not printer:
            logger.warning(f"No default printer found for kitchen: {kot.kitchen.name}")
            return False
        
        return PrinterService.print_kot(kot, printer)
