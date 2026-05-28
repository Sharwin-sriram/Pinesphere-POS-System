"""ViewSets for billing/order APIs."""

from __future__ import annotations

from django.http import HttpResponse
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

from .models import Order
from .serializers import (
    AddOrderItemSerializer,
    HoldResumeSerializer,
    OrderCreateSerializer,
    OrderReadSerializer,
    OrderUpdateSerializer,
    PaymentSerializer,
    RefundSerializer,
    VoidOrderItemSerializer,
)
from .services import (
    add_item,
    apply_coupon,
    apply_discount,
    create_order,
    generate_gst_invoice_pdf,
    get_order_or_404,
    process_payment,
    process_refund,
    tenant_scoped_orders_for_user,
    void_item,
)


def success_response(data=None, meta=None, http_status=status.HTTP_200_OK):
    return Response(
        {
            "success": True,
            "data": data or {},
            "meta": meta or {},
        },
        status=http_status,
    )


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


class OrderViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardPagination

    def list(self, request):
        queryset = tenant_scoped_orders_for_user(request.user)
        status_filter = request.query_params.get("status")
        date_filter = request.query_params.get("date")
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if date_filter:
            queryset = queryset.filter(created_at__date=date_filter)

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        serializer = OrderReadSerializer(page, many=True)
        return success_response(
            data={"results": serializer.data},
            meta={
                "total_count": paginator.page.paginator.count,
                "next": paginator.get_next_link(),
                "previous": paginator.get_previous_link(),
            },
        )

    def retrieve(self, request, pk=None):
        order = get_order_or_404(pk)
        return success_response(data=OrderReadSerializer(order).data)

    def create(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = create_order(
            tenant=getattr(request.user, "restaurant_id", None),
            branch=serializer.validated_data.get("branch"),
            order_type=serializer.validated_data.get("order_type"),
            table_id=serializer.validated_data.get("table_id"),
            items=serializer.validated_data.get("items", []),
        )
        if serializer.validated_data.get("customer_name"):
            order.customer_name = serializer.validated_data["customer_name"]
        if serializer.validated_data.get("customer_phone"):
            order.customer_phone = serializer.validated_data["customer_phone"]
        if serializer.validated_data.get("notes"):
            order.notes = serializer.validated_data["notes"]
        order.save(update_fields=["customer_name", "customer_phone", "notes", "updated_at"])
        return success_response(data=OrderReadSerializer(order).data, http_status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk=None):
        order = get_order_or_404(pk)
        serializer = OrderUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        for field in ("notes", "status", "customer_name", "customer_phone"):
            if field in serializer.validated_data:
                setattr(order, field, serializer.validated_data[field])
        order.save(update_fields=["notes", "status", "customer_name", "customer_phone", "updated_at"])
        return success_response(data=OrderReadSerializer(order).data)

    @action(detail=True, methods=["post"], url_path="hold")
    def hold(self, request, pk=None):
        order = get_order_or_404(pk)
        serializer = HoldResumeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order.status = "pending"
        notes = serializer.validated_data.get("notes")
        if notes:
            order.notes = f"{order.notes or ''}\nHOLD: {notes}".strip()
        order.save(update_fields=["status", "notes", "updated_at"])
        return success_response(data=OrderReadSerializer(order).data)

    @action(detail=True, methods=["post"], url_path="resume")
    def resume(self, request, pk=None):
        order = get_order_or_404(pk)
        serializer = HoldResumeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order.status = "confirmed"
        notes = serializer.validated_data.get("notes")
        if notes:
            order.notes = f"{order.notes or ''}\nRESUME: {notes}".strip()
        order.save(update_fields=["status", "notes", "updated_at"])
        return success_response(data=OrderReadSerializer(order).data)

    @action(detail=True, methods=["post"], url_path="items")
    def add_order_item(self, request, pk=None):
        order = get_order_or_404(pk)
        serializer = AddOrderItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item_id = serializer.validated_data.get("menu_item_id") or serializer.validated_data.get("item_name")
        item = add_item(
            order=order,
            menu_item_id=item_id,
            qty=serializer.validated_data["qty"],
            modifiers=serializer.validated_data.get("modifiers"),
            notes=serializer.validated_data.get("notes"),
            unit_price=serializer.validated_data.get("unit_price", 0),
        )
        return success_response(data={"item_id": str(item.id), "order": OrderReadSerializer(order).data})

    @action(detail=True, methods=["delete"], url_path=r"items/(?P<item_id>[^/.]+)")
    def void_order_item(self, request, pk=None, item_id=None):
        order = get_order_or_404(pk)
        serializer = VoidOrderItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item = void_item(order, item_id, serializer.validated_data.get("reason"))
        return success_response(data={"item_id": str(item.id), "status": item.status})

    @action(detail=True, methods=["post"], url_path="payment")
    def payment(self, request, pk=None):
        order = get_order_or_404(pk)
        serializer = PaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment_result = process_payment(order, serializer.validated_data["payment_lines"])
        return success_response(data=payment_result)

    @action(detail=True, methods=["post"], url_path="refund")
    def refund(self, request, pk=None):
        get_order_or_404(pk)
        serializer = RefundSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = process_refund(
            serializer.validated_data["payment_id"],
            serializer.validated_data["amount"],
            serializer.validated_data.get("reason"),
        )
        return success_response(data=result)

    @action(detail=True, methods=["get"], url_path="invoice")
    def invoice(self, request, pk=None):
        order = get_order_or_404(pk)
        pdf_bytes = generate_gst_invoice_pdf(order)
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="invoice-{order.order_number}.pdf"'
        return response

    @action(detail=True, methods=["post"], url_path="discount")
    def discount(self, request, pk=None):
        order = get_order_or_404(pk)
        discount_type = request.data.get("discount_type", "manual")
        value = request.data.get("value", 0)
        reason = request.data.get("reason", "")
        order = apply_discount(order, discount_type, value, reason)
        return success_response(data=OrderReadSerializer(order).data)

    @action(detail=True, methods=["post"], url_path="coupon")
    def coupon(self, request, pk=None):
        order = get_order_or_404(pk)
        coupon_code = request.data.get("coupon_code", "")
        order = apply_coupon(order, coupon_code)
        return success_response(data=OrderReadSerializer(order).data)
