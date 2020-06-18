const dom  = document.querySelector('body')
const uiAlert = dom.querySelector('.ui-alert')
const uialertText = uiAlert.querySelector('.ui-alert-text')
const addTeamPanel = dom.querySelector('.add-teams');

//@Date
const dJS = new Date();
const dtf = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'short', day: '2-digit' }) 
const [{ value: mo },,{ value: da },,{ value: ye }] = dtf.formatToParts(dJS) 
const TRUEdate = `${da}-${mo}-${ye}`;


//@Global Secondary Alert UI
const callUIalert = () => {
    setTimeout(() => { uiAlert.classList.add('ui-alert-animated') }, 500)
    setTimeout(() => {
        uiAlert.classList.remove('ui-alert-animated')
        uialertText.innerHTML  = ''
    }, 6000);
}


//@On Team Page
if (dom.querySelector('#teamLocation')) {
    const teamLocFilter = document.querySelector('#location-team')
    dom.querySelector('#teamLocation').value = teamLocFilter.options[teamLocFilter.selectedIndex].innerHTML
    //#Listener
    teamLocFilter.addEventListener('change', () => {
    dom.querySelector('#teamLocation').value = teamLocFilter.options[teamLocFilter.selectedIndex].innerHTML
})
}



if (dom.querySelector('.add-teams')) {
    const teamForm = dom.querySelector('.add-teams')

//@Global Team form --G
  teamForm.addEventListener('submit', (e) => {
        e.preventDefault()

        fetch('/add-teams', {
          method: 'post',
          headers: {
             'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            locid: teamForm['locid'].value,
            workemail: teamForm['workemail'].value,
            fullname: teamForm['fullname'].value,
            role: teamForm['role'].value,
            location: teamForm['location'].value
         })
        }).then(res => {
            if(res.status === 200){
                uialertText.innerHTML = 'A new team member has been added!'
                callUIalert()
                setTimeout(() => { location.reload() }, 5000)
            }
        })
  })
    

    //@Invite Button Trigger --G
  dom.querySelector('.invite-btn').addEventListener('click', () => {
     if(addTeamPanel.classList.contains('hide')){
         addTeamPanel.classList.remove('hide')
     } else {
         addTeamPanel.classList.add('hide')
     }
})
}



//@Single Location Page
if (dom.querySelector('.single-locations')) {
    
const addr = dom.querySelector('#addr').innerHTML;
const lat = dom.querySelector('#lat').innerHTML;
const lng = dom.querySelector('#lng').innerHTML;
const calendarForm = dom.querySelector('.--calendar form')
const calenderPop = dom.querySelector('.calendar-overlay-settings')
const plannerForm = dom.querySelector('.location-visit-planner')
const updateSmsForm = dom.querySelector('.update-sms')
const updatemapForm = dom.querySelector('.update-location')

    

let map = L.map('smap').setView([40.91, -96.63], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(map);
      map.panTo(new L.LatLng(parseInt(lat), parseInt(lng)));
      L.marker([parseInt(lat), parseInt(lng)], 5).addTo(map).bindPopup(addr).openPopup();

      //# Tabs Trigger
      dom.querySelector('.location-name').addEventListener('click', () => {
          dom.querySelector('.--location').style.transform = 'translateY(0%)'
      })

      dom.querySelector('.visit-planner').addEventListener('click', () => {
          dom.querySelector('.--planner').style.transform = 'translateY(0%)'
      })
      dom.querySelector('.opening-hours').addEventListener('click', () => {
          dom.querySelector('.--calendar').style.transform = 'translateY(0%)'
      })
      dom.querySelector('.set-sms').addEventListener('click', () => {
          dom.querySelector('.--text-sms').style.transform = 'translateY(0%)'
      })
      dom.querySelector('.team-members').addEventListener('click', () => {
          dom.querySelector('.--team').style.transform = 'translateY(0%)'
      })


      //# Close Tab Trigger
      dom.querySelectorAll('.close-page').forEach((cl) => {
         cl.addEventListener('click', (e) => {
         e.preventDefault()
          dom.querySelectorAll('.global-page').forEach((gl) => {
            gl.style.transform = 'translateY(-100%)'
          })
         }) 
      })


      //@ Checkbox EventListener --G
       dom.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
        checkbox.addEventListener( 'change', function() {
            if(this.checked) {
                this.value = 'yes'
            } else {
                this.value = 'no'
            }
        });
       })


        //@Copy to clipboard
    dom.querySelector('.copy-code').addEventListener('click', (e) => {
    let copyTextarea = dom.querySelector('.ac-to-clip');
    copyTextarea.select();

    try {
      let successful = document.execCommand('copy');
      let msg = successful ? 'successful' : 'unsuccessful';

      //@Add class and Text if successful
      if (msg == 'successful') {
        dom.querySelector('.copy-info').textContent = 'Copied!';
        setTimeout(() => {
          dom.querySelector('.copy-info').textContent = 'Copy page link';
        }, 5000);
      }
      } catch (err) { console.log('Oops, unable to copy'); }
    });

let Calendar = tui.Calendar;
new Calendar('#calendar', {
  defaultView: 'month',
  taskView: false,
  month: {
      visibleWeeksCount: 2 // visible week count in monthly
    },
  template: {
    monthDayname: function(dayname) {
      return '<span class="calendar-week-dayname-name">' + dayname.label + '</span>';
    }
  }
});



  //# Planner Checkboxes
if(dom.querySelector('#checkreqphone').value == 'yes'){
    dom.querySelector('input[name=requiredphone]').value = 'yes'
    dom.querySelector('input[name=requiredphone]').checked = true
} 

if(document.querySelector('#requiredEmailValue').value == 'yes'){
    dom.querySelector('input[name=requiredemail]').value = 'yes'
    dom.querySelector('input[name=requiredemail]').checked = true
} 

if(dom.querySelector('#allowRemoteValue').value == 'yes'){
    dom.querySelector('input[name=allowqueue]').value = 'yes'
    dom.querySelector('input[name=allowqueue]').checked = true
} 


//@Calendar
dom.querySelectorAll('.week-props').forEach((weekprops) => {
    weekprops.addEventListener('click', (e) => {
        if(calenderPop.classList.contains('hide')){
            calenderPop.classList.remove('hide')
            calenderPop.classList.add(e.target.className)
        } else {
            calenderPop.className = 'calendar-overlay-settings'
            calenderPop.classList.add('hide')
        }
   })


    //@Submit Calendar
    calendarForm.addEventListener('submit', (e) => {
           e.preventDefault()
            const startTime = calenderPop.querySelector('input[name=start]')
            const endTime = calenderPop.querySelector('input[name=end]')
            const fullTime = `${startTime.value}  ${endTime.value}`
            let ch = weekprops.firstElementChild
            if(calenderPop.classList.contains(ch.className)){
                let finalValue = weekprops.firstElementChild
                finalValue.value = fullTime
                console.log(fullTime, finalValue);

                fetch('/update-calendar', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                    locid: calendarForm['locid'].value, 
                    sun: calendarForm['sun'].value,
                    mon: calendarForm['mon'].value,
                    tue: calendarForm['tue'].value,
                    wen: calendarForm['wen'].value,
                    thu: calendarForm['thu'].value,
                    fri: calendarForm['fri'].value,
                    sat: calendarForm['sat'].value,
                    //next week
                    sun2: calendarForm['sun2'].value,
                    mon2: calendarForm['mon2'].value,
                    tue2: calendarForm['tue2'].value,
                    wen2: calendarForm['wen2'].value,
                    thu2: calendarForm['thu2'].value,
                    fri2: calendarForm['fri2'].value,
                    sat2: calendarForm['sat2'].value,
                    })
                }).then(res => {
                    if (res.status == 200) {
                        uialertText.innerHTML  = `Time updated! You're set to go!`
                        callUIalert()
                        setTimeout(() => { location.reload() }, 3000)
                    }
                }) 


            }         
    })

    

  //@Check if value and Append 
  weekprops.querySelectorAll('input[type=text]').forEach((inputs) => {
    let swithcBox = document.createElement('input')
    swithcBox.type = 'checkbox'
    let switchLabel = document.createElement('label')
    switchLabel.className = 'switch'
   
    if(inputs.value == null || inputs.value == "  " || inputs.value == ""){
        let isParent = inputs.closest('.week-props')
        isParent.appendChild(switchLabel)
      } else {
        inputs.closest('.week-props').appendChild(switchLabel)
        switchLabel.classList.add('ischecked')
      }
  })
})


//@ Calendar
calenderPop.addEventListener('click', (e) => {
    if(e.target.classList.contains('calendar-overlay-settings')){
        calenderPop.className = 'calendar-overlay-settings'
        calenderPop.classList.add('hide')
    }
})

//@ Planner URL Add '-' on every space
let plannerURL = dom.querySelector('input[name=vpurl]');
plannerURL.addEventListener('keyup', () => {
    plannerURL.value = plannerURL.value.replace(/\s+/g, '-').toLowerCase(); 
})


 //@Submit Planner
plannerForm.addEventListener('submit', (e) => {
    e.preventDefault()

    fetch('/update-planner', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        locid: plannerForm['locid'].value, 
        header: plannerForm['header'].value,
        subheader: plannerForm['subheader'].value,
        notes: plannerForm['notes'].value,
        vpurl: plannerForm['vpurl'].value,
        adminmail: plannerForm['adminmail'].value,
        adminphone: plannerForm['adminphone'].value,
        allowqueue: plannerForm['allowqueue'].value,
        requiredemail: plannerForm['requiredemail'].value,
        requiredphone: plannerForm['requiredphone'].value,
        msg: plannerForm['msg'].value
        })
    }).then(res => {
        if(res.status === 200){
            uialertText.innerHTML  = `All has been updated! You're set to go!`
            callUIalert()
            setTimeout(() => { location.reload() }, 3000)
        } else if(res.status == 201){
            uialertText.innerHTML  = `All has been updated, except for URL. Why? Because it's already in use.`
            callUIalert()
            setTimeout(() => { location.reload() }, 3000)
        } 
    })
})
 

//@Update Location
updatemapForm.addEventListener('submit', (e) => {
    e.preventDefault()

    fetch('/update-location', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        locid: updatemapForm['locid'].value,
        title: updatemapForm['title'].value,
        num: updatemapForm['num'].value 
        })
    }).then(res => {
        if(res.status === 200){
            uialertText.innerHTML = 'Location has been updated!'
            callUIalert()
            setTimeout(() => { location.reload() }, 3000)
        }
    })
})


//@Update SMS Message
  updateSmsForm.addEventListener('submit', (e) => {
        e.preventDefault()

        fetch('/update-sms', {
          method: 'post',
          headers: {
             'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            locid: updateSmsForm['locid'].value,
            title: updateSmsForm['sms'].value,
         })
        }).then(res => {
            if(res.status === 200){
                uialertText.innerHTML = 'SMS Text has been updated!'
                callUIalert()
                setTimeout(() => { location.reload() }, 3000)
            }
        })
    })


}
//@End of Single Location===========================


//@Begin SetUp Page==========================
if (dom.querySelector('.setup')) {
    
    let map = L.map('map').setView([40.91, -96.63], 4);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
  
    let searchControl = L.esri.Geocoding.geosearch().addTo(map);
    let geocodeService = L.esri.Geocoding.geocodeService();

    //@Export Value
    const locationForm = dom.querySelector('.location-form')
    const virtualMethod = dom.querySelector('.virtual-method')
    let addrHolder = dom.querySelector('.addr-holder')
    L.layerGroup().addTo(map);
  
    searchControl.on('results', function (e) {
        geocodeService.reverse().latlng(e.latlng).run(function (error, result) {
            if (error) {return; }
            L.marker(result.latlng).addTo(map).bindPopup(result.address.Match_addr).openPopup();
            locationForm['locaddress'].value = result.address.Match_addr;
            addrHolder.textContent = result.address.Match_addr;


            locationForm.addEventListener('submit', (e) => {
                e.preventDefault()

                //@Save to DB
                fetch('/savelocation', {
                    method: 'post',
                    headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        locname: locationForm['locname'].value,
                        locaddress: locationForm['locaddress'].value,
                        date: TRUEdate,
                        lat: `${result.latlng.lat}`,
                        lng: `${result.latlng.lng}`,
                        method: locationForm['method'].value
                      })
                    }).then(res => {
                    if (res.status == 200) {
                        uialertText.innerHTML = 'This location has been saved!'
                        callUIalert()
                        setTimeout(() => { location.href = '/u/places' }, 3000)
                        
                      }
                    })
                
            })
        });
    });


    document.querySelector('.go-next-method').addEventListener('click', (e) => {
      e.preventDefault()
      if( locationForm['locname'].value != '' && locationForm['locaddress'].value != ''){
        locationForm.classList.add('hide')
        virtualMethod.classList.remove('hide-force')
        dom.querySelector('.setup .header-box').innerHTML = `How would you like to greet and sign in visitors? (This won't affect anything)`
      }

    })


    virtualMethod.querySelectorAll('.card').forEach((cards) => {
      cards.addEventListener('click', (e) => {
        let cardVal = cards.querySelector('span').innerHTML;
       let cardALT =  virtualMethod.querySelectorAll('.card')
         
       for(let i = 0; i < cardALT.length; i++){
        cardALT[i].classList.remove('card-selected')
       }
       
       cards.classList.add('card-selected')
        locationForm['method'].value = cardVal;
        document.querySelector('.reveal-location').classList.remove('hide')
        
        locationForm.querySelectorAll('.row, .location-map, .--dash, .go-next-method, .tag').forEach((el) => {
          el.classList.add('hide')
        })
        locationForm.classList.remove('hide')
      })
    })
}

//@End of Setup page==============================

//@Begin Service Page==============================
 
if (dom.querySelector('.left-service-top')) {
    
    const globalOverlay = dom.querySelector('.global-overlay')
    const uVisitorForm = dom.querySelector('.add-v-via-admin__form')
    const filter = document.querySelector('#filter')
    const label = document.querySelector('input[name=labels]')
    const preferedId = document.querySelector('input[name=locid]')

    const queryQueue = () => {
        fetch('/query-visitors', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                locid: preferedId.value,
                email: label.value
            })
        }).then((res) => {
            return res.json()
        }).then((res) => {
            let queueHolder = dom.querySelector('#queue-holder')
            let servedHolder = document.querySelector('#served-holder')
            let servingHolder = document.querySelector('#serving-holder')
            res.data.visitors.forEach(found => {
                if (found.line == res.location._id) {
                    if (found.status == 'Waiting') {
                        let li = document.createElement('li')
                        li.innerHTML = `
                        <span class="queue-visitor__fullname">${found.firstname}</span>
                          <p class="queue-visitor__waiting">
                            <i class="hide">${found._id}</i>
                            <small class="hide visitor-label">${found.labels}</small>
                            <small class="location-id hide">${res.location._id}</small>
                            <span class="queue-status">${found.status}</span> in <small>${res.location.name}</small>
                           <div class="queue-time-real tag">
                            <small class="waiting-hours"></small> hrs
                            <small class="waiting-minutes"></small> mins
                           </div>
                         </p>
                         <div class="update-user-progress buttn">
                           <ion-icon name="chatbox-ellipses-outline"></ion-icon>
                          <span class="u-number">${found.phone}</span>
                         </dv>
                        `
                        queueHolder.innerHTML = ''
                        setTimeout(() => { queueHolder.appendChild(li) }, 1000);
                        //@Eventlistener for SMS click to send meesage
                        let uProgressSmS = li.querySelector('.update-user-progress')
                        uProgressSmS.addEventListener('click', (e) => {
                            let gotPhone = e.target.nextElementSibling
                            if (dom.querySelector('#uus')) {
                                dom.querySelector('#uus').value = gotPhone.innerHTML;
                                dom.querySelector('.update-u-sms').classList.remove('hide')
                            }
                        })
                        function parseISOString(s) {
                            var b = s.split(/\D+/);
                            return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
                        }
                        let waiting = parseISOString(found.date)
                        setInterval(() => {
                                
                            // get total seconds between the times
                            let delta = Math.abs(waiting - Date.now()) / 1000;
                            // calculate (and subtract) whole days
                            let days = Math.floor(delta / 86400);
                            delta -= days * 86400;
                            // calculate (and subtract) whole hours
                            let hours = Math.floor(delta / 3600) % 24;
                            delta -= hours * 3600;
                            // calculate (and subtract) whole minutes
                            let minutes = Math.floor(delta / 60) % 60;
                            delta -= minutes * 60;
                            // what's left is seconds
                            let seconds = delta % 60;
                
                            li.querySelectorAll('.waiting-minutes').forEach((mins) => {
                                mins.innerHTML = minutes
                            })
                            li.querySelectorAll('.waiting-hours').forEach((hrs) => {
                                hrs.innerHTML = hours
                            })
                        }, 4000)
                    }
                    //@Served
                    if (found.status == 'Served' && servedHolder) {
                        let li = document.createElement('li')
                        li.innerHTML = `
                        <span class="queue-visitor__fullname">${found.firstname}</span>
                          <p class="queue-visitor__waiting">
                            <i class="hide">${found._id}</i>
                            <small class="hide visitor-label">${found.labels}</small>
                            <small class="location-id hide">${res.location._id}</small>
                            <span class="queue-status">${found.status}</span> in <small>${res.location.name}</small>
                           <div class="queue-time-real">
                          <small class="waiting-hours tag">${found.timeused}</small>
                        </div>
                        </p>
                        `
                        servedHolder.innerHTML = ''
                        setTimeout(() => { servedHolder.appendChild(li) }, 1000);
                    }
                    //@Serving now
                    if (found.status == 'Serving' && servingHolder) {
                        let li = document.createElement('li')
                        li.innerHTML = `
                        <span class="queue-visitor__fullname">${found.firstname}</span>
                          <p class="queue-visitor__waiting">
                            <i class="hide">${found._id}</i>
                            <small class="hide visitor-label">${found.labels}</small>
                            <small class="location-id hide">${res.location._id}</small>
                            <span class="queue-status">${found.status}</span> in <small>${res.location.name}</small>
                           <div class="queue-time-real">
                          <small class="waiting-hours tag">${found.timeused}</small>
                        </div>
                        </p>
                        `
                        servingHolder.innerHTML = ''
                        setTimeout(() => { servingHolder.appendChild(li) }, 1000);
                    }
          
                }
            
            })
        })

        //@Count Visitors
        setTimeout(() => {
            if (dom.querySelector('.visitors-number')) {
                dom.querySelector('.visitors-number').innerHTML = document.getElementById('queue-holder').getElementsByTagName("li").length;
            }
            if (dom.querySelector('.served-v-number')) {
                dom.querySelector('.served-v-number').innerHTML = document.getElementById('served-holder').getElementsByTagName("li").length;
            }
        }, 3000)
    }

    
    filter.addEventListener('change', () => {
        preferedId.value = filter.value;
        queryQueue()
    })

    window.addEventListener('DOMContentLoaded', () => {
        preferedId.value = filter.value;
        queryQueue()
    })


   
    dom.querySelector('.add-visitor-v-admin').addEventListener('click', (e) => {
        e.preventDefault()
        uVisitorForm.classList.remove('hide')
        globalOverlay.classList.remove('hide')
    })
  

    const closeOverlayEls = () => {
        uVisitorForm.classList.add('hide')
        globalOverlay.classList.add('hide')
    }

    globalOverlay.addEventListener('click', (e) => {
        if (e.target.classList.contains('global-overlay')) {
            closeOverlayEls()
        }
    })



    uVisitorForm.addEventListener('submit', (e) => {
        e.preventDefault()

        fetch('/add-vistor', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                locid: uVisitorForm['locid'].value,
                firstname: uVisitorForm['firstname'].value,
                phone: uVisitorForm['phone'].value.replace(/\D/g, ''),
                labels: uVisitorForm['labels'].value
            })
        }).then(res => {
            if (res.status === 200) {
                closeOverlayEls()
                uialertText.innerHTML = 'Visitor has been added!'
                callUIalert()
                queryQueue()
            }
        })
    })


    var intId;
    const startServingTimer = () => {
        if (dom.querySelector('.shr')) {
            let minutesLabel = document.querySelector('.smin')
            let secondsLabel = document.querySelector('.ssec')
            let hourLabel = document.querySelector('.shr')
            
            let totalSeconds = 0;
           
            function setTime() {
              ++totalSeconds;
              secondsLabel.innerHTML = totalSeconds % 60;
              minutesLabel.innerHTML = parseInt(totalSeconds / 60);
              hourLabel.innerHTML = parseInt(totalSeconds / 3600);
            }
         
            intId = setInterval(setTime, 1000);
        }
    }

 
   

    //@Show serving
    if (dom.querySelector('.--serving-page')) {
        dom.querySelector('.call-visitor-v-admin').addEventListener('click', (e) => {
            e.preventDefault()
    
            let serveThis = document.querySelectorAll("ul > li")[0];
            let visitorId = serveThis.querySelector('i').innerHTML;
            let locationId = serveThis.querySelector('.location-id').innerHTML;
            let visitorLabel = serveThis.querySelector('.visitor-label').innerHTML;
    
    
            fetch('/serve-visitor', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    locationId: locationId,
                    visitorId: visitorId,
                    visitorLabel: visitorLabel
                })
            }).then((res) => {
                return res.json()
            }).then(res => {
                queryQueue()
                startServingTimer()
                dom.querySelector('.top-serving h5').innerHTML = res.data.firstname;
                dom.querySelector('.center-panel .header-box').innerHTML = res.data.firstname;
                dom.querySelector('.serving-phone').innerHTML = res.data.phone;
                dom.querySelector('.served-id').innerHTML = res.data._id;
                dom.querySelector('.serve-email').innerHTML = res.data.labels;
              
            })

              //@Change Button
              dom.querySelector('.call-visitor-v-admin').classList.add('hide')
              dom.querySelector('.finish-visitor-v-admin').classList.remove('hide')
            
        })
    


        //@Change Status to Served
        dom.querySelector('.finish-visitor-v-admin').addEventListener('click', (e) => {
            let id = dom.querySelector('.served-id').innerHTML;
            let label = dom.querySelector('.serve-email').innerHTML;
            let hrlabel = dom.querySelector('.shr').innerHTML;
            let minlabel = dom.querySelector('.smin').innerHTML;
            fetch('/finish-visitor', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id,
                    label: label,
                    timeused: `${hrlabel} hrs : ${minlabel} mins`
                })
            }).then(res => {
                if (res.status == 200) {
                    dom.querySelector('.call-visitor-v-admin').classList.remove('hide')
                    dom.querySelector('.finish-visitor-v-admin').classList.add('hide')
                    queryQueue()
                    clearInterval(intId)
                }
                
            })
        })

        //@Text Visitor
          const sendUUpdateSms = dom.querySelector('.update-u-sms')

            sendUUpdateSms.addEventListener('submit', (e) => {
                e.preventDefault()

                fetch('/text-user', {
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            phone: sendUUpdateSms['upuphone'].value,
                            text: sendUUpdateSms['cmsg'].value,
                        })
                    }).then(res => {
                        if (res.status === 201 || res.status === 200) {
                            uialertText.innerHTML = 'SMS sent!'
                            callUIalert()
                            sendUUpdateSms.classList.add('hide')
                            sendUUpdateSms['upuphone'].value = ''
                        }
                    })
            })

        dom.querySelector('.close-u-up__form').addEventListener('click', () => {
            sendUUpdateSms.classList.add('hide')
            sendUUpdateSms['upuphone'].value = ''
        })
    }
}


if (dom.querySelector('.topper')) {
    const userCredhover = dom.querySelector('.user-cred-hover__placeholder')
    dom.querySelector('.user-cred-hover').addEventListener('mouseenter', () => {
        userCredhover.classList.remove('hide')
    })
    userCredhover.addEventListener('mouseleave', () => {
        userCredhover.classList.add('hide')
    })
}




//@Planner Page - VIRTUL QUEUE
if (dom.querySelector('#queue-page-vistiors-planner')) {
                  
    const addr = dom.querySelector('#addr').innerHTML;
    const lat = dom.querySelector('#lat').innerHTML;
    const lng = dom.querySelector('#lng').innerHTML;
    const queueMsg = dom.querySelector('.queue-msg')

    

let pageMap = L.map('pagemap').setView([40.91, -96.63], 4);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
      }).addTo(pageMap);
      pageMap.panTo(new L.LatLng(parseInt(lat), parseInt(lng)));
      L.marker([parseInt(lat), parseInt(lng)], 5).addTo(pageMap).bindPopup(addr).openPopup();


      let queuePageCount = dom.querySelectorAll('#queue-page-vistiors-planner li')
      dom.querySelector('.poqt-counter').innerHTML = queuePageCount.length

      const joinQform = dom.querySelector('.join-queue-vp__form')


        joinQform.addEventListener('submit', (e) => {
            e.preventDefault()

            fetch('/join-queue', {
                    method: 'post',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        locid: joinQform['locid'].value,
                        labels: joinQform['labels'].value,
                        firstname: joinQform['firstname'].value,
                        phone: joinQform['phone'].value.replace(/\D/g, '')
                    })
                }).then((res) => {
                    return res.json()
                }).then(res => {
                    setTimeout(() => {
                        dom.querySelector('.join-queue-via-planner').classList.add('hide')
                        queueMsg.classList.remove('hide')
                        queueMsg.innerHTML = joinQform['msg'].value;
                        location.reload()
                    }, 1000);
                })

        })
    
    //@Check Position
        const checkPositionForm = dom.querySelector('.check-v-position__form')
        const postionList = dom.querySelectorAll('#queue-page-vistiors-planner li')
        const userPoutput = dom.querySelector('#kl')
        const vqOverlayPostion = dom.querySelector('.visitor-queue-upper-overlay')
        
        checkPositionForm.addEventListener('submit', (e) => {
            e.preventDefault()
        
            fetch('/check-position', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone: checkPositionForm['phone'].value
                })
            }).then((res) => {
                return res.json()
            }).then(res => {
               if(res.userPhone){
        
                dom.querySelectorAll('.pwoqlist').forEach((list) => {
                    if(list.innerHTML == res.userPhone.phone){
        
                        let got = Array.from(postionList)
                        userPoutput.innerHTML = got.indexOf(list)
                        let finalOutput = parseInt(userPoutput.innerHTML, 10) + 1;
                        dom.querySelector('.uq-number__postion').innerHTML = finalOutput;
        
                        //Reveal
                        checkPositionForm.classList.add('hide')
                        vqOverlayPostion.classList.remove('hide')
                        vqOverlayPostion.querySelector('h4 span').innerHTML = res.userPhone.firstname;
                    }
                })
               } else {
                checkPositionForm.classList.add('hide')
                vqOverlayPostion.classList.remove('hide')
                vqOverlayPostion.querySelector('.vquo').classList.add('hide')
                 dom.querySelector('.no-vquo').classList.remove('hide')
               }
            })
        })
        
    
        let localOverlay = dom.querySelector('.global-overlay')
        
        localOverlay.addEventListener('click', (e) => {
            if(e.target.classList.contains('global-overlay')){
                localOverlay.classList.add('hide')
                checkPositionForm.classList.add('hide')
                vqOverlayPostion.classList.add('hide')
            }
        })
        
        dom.querySelectorAll('.call-vp').forEach((callVPbtn) => {
            callVPbtn.addEventListener('click', (e) => {
                e.preventDefault()
                localOverlay.classList.remove('hide')
                checkPositionForm.classList.remove('hide')
            })
        })
}


