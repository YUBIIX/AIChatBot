from django.shortcuts import render
from django.http import HttpResponse
import datetime

def item_list(request):
    # นับจำนวนผู้เข้าชม
    if 'visitorID' not in request.session:
        request.session['visitorID'] = str(datetime.datetime.now())
        if 'visit_count' in request.session:
            request.session['visit_count'] += 1
        else:
            request.session['visit_count'] = 1

    context = {
        'visit_count': request.session['visit_count'],
        'visitorID': request.session['visitorID']
    }
    return render(request, 'myapp/item_list.html', context)
