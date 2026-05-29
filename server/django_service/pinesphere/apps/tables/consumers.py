from channels.generic.websocket import AsyncJsonWebsocketConsumer
import json


class TableStatusConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope.get('user')
        # Expect branch_id as query param
        params = dict((x.split('=') for x in self.scope.get('query_string', b'').decode().split('&') if x))
        branch_id = params.get('branch_id')
        if not branch_id:
            await self.close()
            return
        self.group_name = f'branch_{branch_id}_tables'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
        except Exception:
            pass

    async def table_status(self, event):
        # event contains {table_id, status, order_id}
        await self.send_json(event['data'])
