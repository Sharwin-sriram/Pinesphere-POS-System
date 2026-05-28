from channels.generic.websocket import AsyncJsonWebsocketConsumer


class KitchenConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # expect station_id in querystring
        params = dict((x.split('=') for x in self.scope.get('query_string', b'').decode().split('&') if x))
        station_id = params.get('station_id')
        if not station_id:
            await self.close()
            return
        self.group_name = f'kitchen_station_{station_id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        try:
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
        except Exception:
            pass

    async def new_kot(self, event):
        await self.send_json(event['data'])

    async def kot_update(self, event):
        await self.send_json(event['data'])
