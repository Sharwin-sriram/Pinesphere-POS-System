"""Role to permission mapping used by JWT claims and authorization checks."""

ROLE_PERMISSIONS = {
    "SUPER_ADMIN": ["*"],
    "ORGANIZATION_OWNER": [
        "create_bills", "edit_bills", "cancel_bills",
        "apply_discounts", "view_reports", "manage_menu",
        "inventory_access", "payroll_access", "tax_configuration",
        "branch_management", "user_management"
    ],
    "BRANCH_MANAGER": [
        "create_bills", "edit_bills", "cancel_bills",
        "apply_discounts", "view_reports", "manage_menu",
        "inventory_access", "user_management"
    ],
    "CASHIER": [
        "create_bills", "edit_bills",
        "apply_discounts", "view_reports"
    ],
    "WAITER": [
        "create_bills", "view_reports"
    ],
    "KITCHEN_STAFF": [
        "view_kot"
    ],
    "INVENTORY_MANAGER": [
        "inventory_access", "view_reports"
    ],
    "ACCOUNTANT": [
        "view_reports", "payroll_access", "tax_configuration"
    ],
    "DELIVERY_STAFF": [
        "view_orders"
    ],
    "CUSTOMER": [
        "place_orders"
    ]
}
