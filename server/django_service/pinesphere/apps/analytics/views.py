from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from . import services
from pinesphere.core.exceptions import ServiceError


class DailySalesView(APIView):
    def get(self, request):
        date = request.query_params.get('date')
        branch = request.query_params.get('branch_id')
        data = services.get_daily_sales(branch, date)
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)


class ShiftSummaryView(APIView):
    def get(self, request):
        shift_id = request.query_params.get('shift_id')
        data = services.get_shift_summary(shift_id)
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)


class TopItemsView(APIView):
    def get(self, request):
        frm = request.query_params.get('from')
        to = request.query_params.get('to')
        branch = request.query_params.get('branch_id')
        limit = int(request.query_params.get('limit', 10))
        data = services.get_top_items(branch, frm, to, limit)
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)
