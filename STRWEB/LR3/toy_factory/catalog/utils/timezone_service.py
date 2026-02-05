import pytz
import requests


class TimezoneService:
    @staticmethod
    def get_timezone_from_ip(ip):
        try:
            response = requests.get(f"http://ip-api.com/json/{ip}", timeout=3)
            tz = response.json().get("timezone")
            return pytz.timezone(tz) if tz else pytz.timezone("UTC")
        except Exception:
            return pytz.timezone("UTC")

    @staticmethod
    def get_timezone(request):
        # ip = request.META.get('REMOTE_ADDR')
        # return TimezoneService.get_timezone_from_ip(ip)
        # тест
        test_ip = "8.8.8.8"  # Google Public DNS (пример для США)
        return TimezoneService.get_timezone_from_ip(test_ip)
