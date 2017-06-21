module.exports=function(express,app){
   var router=express.Router(),
   path=require('path');

var list=[];
var get="GET",post="POST",put="PUT",del="DELETE",id=0;

getData=(req,res,date)=>{

  var data={
    "id":id++,
    "time":date.getHours()+":"+date.getMinutes()+":"+date.getSeconds(),
    "method":req.method,
    "path":req.path,
    "query":req.query,
    "body":req.body,
    "headers":req.headers,
    "duration":0
  };
  return data;
}

responseTimeoutList=(req,res,data,startTime)=>{
  setTimeout(()=>{
    data.duration=Math.abs(new Date().getSeconds()-startTime)%60;
    list.push(data);
    res.json(list);
  },1000)
}

responseTimeoutData=(req,res,data,startTime)=>{
  setTimeout(()=>{
    data.duration=Math.abs(new Date().getSeconds()-startTime)%60;
    list.push(data);
    res.json(data);
  },1000)
}


filterListOnMethod=(method)=>{
  var getList=list.filter(l=>{
    return l.method==method
  })
  return getList;
}

no_Of_requests=(method)=>{
  var getList=filterListOnMethod(method);
  return getList.length;
}

getFromTime=(time,index)=>{
  var timeList=time.split(":");
  return parseInt(timeList[index]);
}


getFilteredList=(method)=>{
  var getList=filterListOnMethod(method);
  if(getList.length==0)return null;
  return getList;
}

getSumList=(filterList)=>{
  if(filterList.length==0)return -1;
  var sumList=filterList.map(l=>{
    return l.duration;
  });
  var sum =sumList.reduce((a,b)=>{
    return a+b;
  });
  sum/=sumList.length;
  return sum;
}

getAvgResTimePastHour=(method)=>{
  var getList=getFilteredList(method);
  if(getList==null)return -1;
  var filterList=getList.filter(l=>{
    var currHour=new Date().getHours();
    var prevHour=getFromTime(l.time,0);
    var requestHour=Math.abs(currHour-prevHour);
    if(requestHour<1)return l;
  });

  return getSumList(filterList);
}

getAvgResTimePastMin=(method)=>{
  var getList=getFilteredList(method);
  if(getList==null)return -1;
  var filterList=getList.filter(l=>{
    var currMin=new Date().getMinutes();
    var prevMin=getFromTime(l.time,1);
    var requestMin=Math.abs(currMin-prevMin);
    if(requestMin<1)return l;
  });

  return getSumList(filterList);
}

router.get('/',(req,res,next)=>{
  res.send('Welcome to the application: Try the following end points- /process , /stats');
})

router.get('/process',(req,res,next)=>{
  var date=new Date();
  var startTime=date.getSeconds();
  var data=getData(req,res,date);
  responseTimeoutList(req,res,data,startTime);
})

router.get('/process/:id',(req,res,next)=>{
  var date=new Date();
  var startTime=date.getSeconds();
  list.push(getData(req,res,date));
  var data=list.filter(l=>{
    if(l.id==req.params.id)return l;
  })
  if(data==null || data.length==0)res.send('No such data for this id');
  else res.json(data);
})

router.post('/process',(req,res,next)=>{
  var date=new Date();
  var startTime=date.getSeconds();
  var data=getData(req,res,date);
  responseTimeoutData(req,res,data,startTime);
})
router.put('/process/:id',(req,res,next)=>{
  var date=new Date();
  var startTime=date.getSeconds();
  list=list.filter(l=>{
    if(l.id==req.params.id){
      if(req.body.id)l.id=parseInt(req.body.id);
      if(req.body.time)l.time=req.body.time;
      if(req.body.method)l.method=req.body.method;
      if(req.body.path)l.path=req.body.path;
      if(req.body.query)l.query=req.body.query;
      if(req.body.duration)l.duration=req.body.duration;
    }
    return l;
  });
  var idList=list.filter(l=>{
    if(l.id==req.params.id)return l;
  });
  var data=getData(req,res,date);
  responseTimeoutList(req,res,data,startTime);
})
router.delete('/process/:id',(req,res,next)=>{
  var date=new Date();
  var startTime=date.getSeconds();
  list=list.filter(l=>{
    if(l.id!=req.params.id)return l;
  });
  var data=getData(req,res,date);
  responseTimeoutList(req,res,data,startTime);
})

router.get('/stats',(req,res,next)=>{

if(list==null || list.length==0)res.send('Sorry no stats available you need to make post request first');

var statData={
  "total requests":list.length,
  "No of GET requests":no_Of_requests(get),
  "No of POST requests":no_Of_requests(post),
  "No of PUT requests":no_Of_requests(put),
  "No of DELETE requests":no_Of_requests(del),
  "Avg response time of Get request past hour":getAvgResTimePastHour(get),
  "Avg response time of Post request past hour":getAvgResTimePastHour(post),
  "Avg response time of Put request past hour":getAvgResTimePastHour(put),
  "Avg response time of Delete request past hour":getAvgResTimePastHour(del),
  "Avg response time of Get request past minute":getAvgResTimePastMin(get),
  "Avg response time of Post request past minute":getAvgResTimePastMin(post),
  "Avg response time of Put request past minute":getAvgResTimePastMin(put),
  "Avg response time of Delete request past minute":getAvgResTimePastMin(del)
}

res.json(statData);
})

app.use('/',router);
}
