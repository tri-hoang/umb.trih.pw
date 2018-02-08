var redis = require("redis"),
    client = redis.createClient();
var Sync = require('sync');
var moment = require('moment');



var course;
var change = false;
var data = [];
function aSync() {
    var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream('courses_newest.txt')
    });
    lineReader.on('line', function (line) {
            if (line.includes('|---') && line.includes('http')) {
                line = line.replace('|---https://www.umb.edu/academics/course_catalog/course_info/grd_', '');
                line = line.replace('|---https://www.umb.edu/academics/course_catalog/course_info/ugrd_', '');
                line = line.replace('_2017 Spring_', '-');
                if (course) {
                    console.log('add' + course);
                    console.log(data);
                    client.zadd("scheduler_s2017_v2", 0, course+'%'+JSON.stringify(data));
                    data = [];
                }
                
                course = line.trim().replace('-', '');

            } else if (line.includes('|--')) {
                line = line.replace('|--', '');
                var split = line.split('%');
                // console.log(course + "+" + split[1] + "+" + split[2] + "+" + split[3] + "+" + split[4]) ;

                // TIME PROCESS TuTh | M <br/>04:00 PM - 05:15 PM | 04:00 PM - 05:15 PM
                var result_time = [];
                if (typeof split[3] === 'string') {

                    
                        var proc_time = split[3].trim().split('<br/>');
                        var day = proc_time[0].split('|');
                        var time = proc_time[1].split('|');
                        for (var i = 0; i < day.length; i++) {
                            var temp_time = time[i].split('-');
                            var day_split = day[i].split(/(?=[A-Z])/);
                            for (var j = 0; j < day_split.length; j++) {
                                day_split[j] = day_split[j].replace('M', 'Mo').replace('W', 'We').replace('F', 'Fr')
                                var itemTime = {
                                    day  : day_split[j],
                                    start_time: moment(temp_time[0].trim(), ["h:mm A"]).format("HH:mm"),
                                    end_time: moment(temp_time[1].trim(), ["h:mm A"]).format("HH:mm")
                                }
                                result_time.push(itemTime);
                            }
                        }
                    }
                var extra = (typeof split[1] === 'string' && split[1].includes('D')) ? 'D' : '';
                    
                var se = {
                    classnum: course + extra,
                    classname: split[0].trim(),
                    sectionid: split[1],
                    id: split[2],
                    time: JSON.stringify(result_time),
                    time_display: displayTimeConversion(split[3]),
                    prof: (typeof split[4] === 'string') ? split[4].replace('$', '').trim() : '',
                    location: split[5]
                }
                console.log(split[3]);
                data.push(se);

            }
    });
}

function displayTimeConversion(time) {
    if (time) {
          var proc_time = time.trim().split('<br/>');
          var proc_time2 = proc_time[0].split('|');
          var proc_time3 = proc_time[1].split('|');
          var final_time = '';
          for (var j = 0; j < proc_time2.length; j++) {
            final_time += (proc_time2[j] + Array(10).join(' ')).substring(0, 10) + '|' + proc_time3[j];
            if (j < proc_time2.length) final_time += '</br>';
          }
          return final_time;
      }
      return '';
          
}
Sync(function(){
    aSync();

    // This is bad but I don't have enough time
    setTimeout(function(){ console.log('done' + data); client.zadd("scheduler", 0, course+'%'+JSON.stringify(data)); client.quit();}, 5000);
    
});