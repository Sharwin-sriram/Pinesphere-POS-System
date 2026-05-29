from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from . import services


class MenuForBranchView(APIView):
    def get(self, request):
        branch = request.query_params.get('branch_id')
        data = services.get_menu_for_branch(branch)
        return Response({'success': True, 'data': data, 'meta': {}}, status=status.HTTP_200_OK)


class PushMenuView(APIView):
    def post(self, request):
        source_branch = request.data.get('source_branch')
        targets = request.data.get('target_branch_ids', [])
        applied = services.push_menu_to_branches(source_branch, targets)
        return Response({'success': True, 'data': {'applied': applied}, 'meta': {}}, status=status.HTTP_200_OK)
