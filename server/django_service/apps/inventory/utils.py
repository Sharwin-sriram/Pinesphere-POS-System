from datetime import date


def is_expired(expiry_date):

    return expiry_date < date.today()