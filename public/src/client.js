
const dom  = document.querySelector('body')
const uiAlert = dom.querySelector('.ui-alert')
const uialertText = uiAlert.querySelector('.ui-alert-text')
const addTeamPanel = dom.querySelector('.add-teams');


const socket = io({transports: ['websocket']});


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
    }, 5000);
}


//@On Team Page
if (dom.querySelector('#teamLocation')) {
    const teamLocFilter = document.querySelector('#location-team')
    dom.querySelector('#teamLocation').value = teamLocFilter.options[teamLocFilter.selectedIndex].innerHTML
    if (dom.querySelector('#teamLocationex')) {
        dom.querySelector('#teamLocationex').value = teamLocFilter.options[teamLocFilter.selectedIndex].innerHTML
    }

    //#Listener
    teamLocFilter.addEventListener('change', () => {
        dom.querySelector('#teamLocation').value = teamLocFilter.options[teamLocFilter.selectedIndex].innerHTML
        if (dom.querySelector('#teamLocationex')) {
            dom.querySelector('#teamLocationex').value = teamLocFilter.options[teamLocFilter.selectedIndex].innerHTML
        }
    })
    

    //@Edit and Delete team
    let overlayOnTeam = dom.querySelector('.global-overlay')
    
    dom.querySelectorAll('.open-u-edit-team').forEach(teamEdit => {
        teamEdit.addEventListener('click', (e) => {
            e.preventDefault()
            teamEdit.nextElementSibling.classList.remove('hide')
            overlayOnTeam.classList.remove('hide')
        })
    })



    dom.querySelectorAll('.u-edit-team').forEach((tedit) => {
        tedit.addEventListener('click', (e) => {
            if(e.target.classList.contains('close-u-edit-team')){
                tedit.classList.add('hide')
                overlayOnTeam.classList.add('hide')
            }
        })
    })



    

    dom.querySelectorAll('.open-delete-team').forEach(opendelteam => {
        opendelteam.addEventListener('click', (e) => {
            e.preventDefault()
            opendelteam.nextElementSibling.classList.remove('hide')
            overlayOnTeam.classList.remove('hide')
        })
    })


    dom.querySelectorAll('.close-delete-team').forEach(closedelteam => {
        closedelteam.addEventListener('click', (e) => {
          closedelteam.closest('.delete-team-form').classList.add('hide')
          overlayOnTeam.classList.add('hide')
        })
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
    
      dom.querySelector('.more-option').addEventListener('click', () => {
        dom.querySelector('.--more-opt').style.transform = 'translateY(0%)'
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
        maxnum: plannerForm['maxnum'].value.replace(/\D/g, ''),
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
            sms: updateSmsForm['sms'].value,
         })
        }).then(res => {
            if(res.status === 200){
                uialertText.innerHTML = 'SMS Text has been updated!'
                callUIalert()
                setTimeout(() => { location.reload() }, 3000)
            }
        })
    })



    //@Update Est Time
const saveEsttime = dom.querySelector('.save-est-time')
  saveEsttime.addEventListener('submit', (e) => {
    e.preventDefault()

    fetch('/update-est-time', {
      method: 'post',
      headers: {
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locid: saveEsttime['locid'].value,
        avgwt: saveEsttime['avgwt'].value,
     })
    }).then(res => {
        if(res.status === 200){
            uialertText.innerHTML = 'Est. time has been updated!'
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
          dom.querySelector('.setup .header-box').innerHTML = `How would you like to greet and sign in visitors? (This won't affect anything)`;
      }
      dom.querySelector('.lession').classList.add('hide-force')
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


   


  


    //@Text Visitor
    if (dom.querySelector('.update-u-sms')) {
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
        //@Close Form and Clear form
        dom.querySelector('.close-u-up__form').addEventListener('click', () => {
            sendUUpdateSms.classList.add('hide')
            sendUUpdateSms['upuphone'].value = ''
        })
    }
    


    


 


    
    








    function queryQueue(){
        
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
            res.data.visitors.forEach(found => {
                if (found.line == preferedId.value/*res.location._id*/) {
                    if (found.status === 'Waiting') {
    
                        let li = document.createElement('li')
                        li.innerHTML = `
                        <span class="queue-visitor__fullname">${found.firstname}</span>
                          <p class="queue-visitor__waiting">
                            <i class="hide vs-id">${found._id}</i>
                            <small class="hide visitor-label">${found.labels}</small>
                            <small class="location-id hide">${res.location._id}</small>
                            <span class="queue-status">${found.status}</span> in <small>${res.location.name}</small>
                           <div class="queue-time-real tag">
                            <small class="waiting-hours"></small> hrs
                            <small class="waiting-minutes"></small> mins
                            <small class="real-date hide">${new Date(Date.parse(found.date))}</small>
                           </div>
                         </p>
                         <div class="update-user-progress buttn">
                           <ion-icon name="chatbox-ellipses-outline"></ion-icon>
                          <span class="u-number">${found.phone}</span>
                         </div>
                        `
                        queueHolder.innerHTML = ''
                        setTimeout(() => { queueHolder.appendChild(li) }, 500);
                        li.querySelector('.update-user-progress').addEventListener('click', () => {
                            let phone = li.querySelector('.u-number').innerHTML;
                            dom.querySelector('#uus').value = phone;
                            dom.querySelector('.update-u-sms').classList.remove('hide')
                        })
                      
                    }
                    
                    //@Served
                    if (found.status == 'Served' && servedHolder) {
                        let li = document.createElement('li')
                        li.innerHTML = `
                        <span class="queue-visitor__fullname">${found.firstname}</span>
                          <p class="queue-visitor__waiting">
                            <i class="hide vs-id">${found._id}</i>
                            <small class="hide visitor-label">${found.labels}</small>
                            <small class="location-id hide">${res.location._id}</small>
                            <span class="queue-status">${found.status}</span> in <small>${res.location.name}</small>
                           <div class="queue-time-real">
                          <small class="waiting-hours tag">${found.timeused}</small>
                        </div>
                        </p>
                        `
                        servedHolder.innerHTML = ''
                        setTimeout(() => { servedHolder.appendChild(li) }, 500);
                    }
                    if (dom.querySelector('#sms-dyno')) {
                        dom.querySelector('#sms-dyno').innerHTML = res.location.sms
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

 






}



    //@Show serving
    var intId;
    function startServingTimer(){
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
if (dom.querySelector('.--serving-page')) {

        dom.querySelector('.call-visitor-v-admin').addEventListener('click', (e) => {
            e.preventDefault()
            let ul = dom.querySelector('#queue-holder > li')
            let locid = ul.querySelector('.location-id').innerHTML;
            let vsid = ul.querySelector('.vs-id').innerHTML;
            let email = ul.querySelector('.visitor-label').innerHTML;
            let phone = ul.querySelector('.u-number').innerHTML;
            let name = ul.querySelector('.queue-visitor__fullname').innerHTML
            let smsdyno = dom.querySelector('#sms-dyno').innerHTML
            fetch('/serve-visitor', {
                method: 'post',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    locid: locid,
                    vsid: vsid,
                    phone: phone,
                    sms: smsdyno
                })  
            }).then(res => {
                console.log(res);
                if (res.status === 200) {
                    socket.emit('emiting', {
                        type: 'serving',
                        name: name,
                        email: email,
                        phone: phone,
                        vsid: vsid
                    })
                }
                
            })
            
            
    
 
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
                    socket.emit('emiting', {
                        type: 'finished'
                    })
                }
                
            })
        })
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
if (dom.querySelector('.check-v-position__form')) {
    const localOverlay = dom.querySelector('.global-overlay')
    const checkPositionForm = dom.querySelector('.check-v-position__form ')
        localOverlay.addEventListener('click', (e) => {
            if(e.target.classList.contains('global-overlay')){
                localOverlay.classList.add('hide')
                checkPositionForm.classList.add('hide')
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







if (dom.querySelector('.queue-msg')) {
 //@Join and Check Queue   
const checkPositionForm = document.querySelector('.check-v-position__form')
const queueMsg = document.querySelector('.queue-msg')
const joinQform = document.querySelector('.join-queue-vp__form')

    const hideOnSubmit = () => {
        if (dom.querySelector('.already-ck')) {
            document.querySelector('.already-ck').classList.add('hide')
            document.querySelector('.visitor-postion').classList.remove('hide')
            checkPositionForm.classList.add('hide')
            document.querySelector('.global-overlay').classList.add('hide')
        }
    }
    
checkPositionForm.addEventListener('submit', (e) => {
      e.preventDefault()
      updateCounter()
      hideOnSubmit()
 })



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
                    phone: joinQform['phone'].value.replace(/\D/g, ''),
                    placename: joinQform['placename'].value
                })
            }).then((res) => {
                return res.json()
            }).then(res => {
                setTimeout(() => {
                    document.querySelector('.join-queue-via-planner').classList.add('hide')
                    queueMsg.classList.remove('hide')
                    queueMsg.innerHTML = joinQform['msg'].value;
                    joinQform['firstname'].value = ''
                    window.scrollTo(0, 0);
                    hideOnSubmit()
                    socket.emit('emiting', {
                        type: 'added',
                        name: res.user.firstname,
                        phone: res.user.phone,
                        id: res.user._id,
                        label: res.user.labels,
                        status: res.user.status,
                        line: res.user.line,
                        date: res.user.date,
                        place: res.user.place
                })
                }, 1000);
            })
    })


}



//@Update Counter on Visitors Page
function updateCounter() {
    const joinQform = document.querySelector('.join-queue-vp__form')
    const checkPositionForm = document.querySelector('.check-v-position__form')

    const label = document.querySelector('input[name=labels]')
    const preferedId = document.querySelector('input[name=locid]')

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
        }).then(res => {
            const visitorsCount = Array.from(res.data.visitors)
            visitorsCount.forEach(visitorsNow => {
                if(visitorsNow.line === preferedId.value){
                    //@Filter Array
                    let finalVC = visitorsCount.filter((el) => {
                        return el.status == 'Waiting' & el.line === preferedId.value/*res.location._id*/;
                    })
                    dom.querySelector('.poqt-counter').innerHTML = finalVC.length;
                    const findVisitorPostion = () => {
                        if(visitorsNow.phone === joinQform['phone'].value || visitorsNow.phone === checkPositionForm['phone'].value){
                            dom.querySelector('.reatime-postion').textContent = finalVC.indexOf(visitorsNow) + 1;
                            dom.querySelector('.visitor-n-on-v').textContent = visitorsNow.firstname;
                        }

                        const maxmumber = dom.querySelector('.maximun-visitor')
                        const realV = dom.querySelector('.poqt-counter')

                        if (parseInt(realV.innerHTML, 10) >= parseInt(maxmumber.innerHTML, 10)) {
                            dom.querySelector('.maxnum-vfilled').style.display = 'none'
                            dom.querySelector('.green-tag').innerHTML = 'Currently unvailable'
                            dom.querySelector('.green-tag').style.backgroundColor = '#ff3860'
                            dom.querySelector('.show-join-queue__form').classList.add('hide')
                        }
                    }
                    findVisitorPostion()
                }
            })
        })
}




//@Get Visitotors Waiting time
const getWaitingDuration = () => {
    dom.querySelectorAll('#queue-holder li').forEach((li) => {

        let datefrmdb = li.querySelector('.real-date').innerHTML
        let then = new Date(Date.parse(datefrmdb))   
        let now = new Date()
        let ms = moment(now,"DD/MM/YYYY HH:mm:ss").diff(moment(then,"DD/MM/YYYY HH:mm:ss"));
        let d = moment.duration(ms);
        let hrs = Math.floor(d.asHours())
        let min = moment.utc(ms).format("mm");

        li.querySelector('.waiting-hours').innerHTML = hrs
        li.querySelector('.waiting-minutes').innerHTML = min
    })
}
setInterval(() => { getWaitingDuration() }, 5000)

//@Add Visitors, Monitor Changes
socket.on('emiting', appendVisitor)

function appendVisitor(data) {
    if (dom.querySelector('#queue-holder')) {
        if (data.type == 'added') {
            ul = dom.querySelector('#queue-holder')
            let li = document.createElement('li')
        
            li.innerHTML = `
            <span class="queue-visitor__fullname">${data.name}</span>
              <p class="queue-visitor__waiting">
                <i class="hide vs-id addr-holder">${data.id}</i>
                <small class="hide visitor-label">${data.label}</small>
                <small class="location-id hide">${data.line}</small>
                <span class="queue-status">${data.status}</span> in <small>${data.place}</small>
               <div class="queue-time-real tag">
                <small class="waiting-hours"></small> hrs
                <small class="waiting-minutes"></small> mins
                <small class="real-date hide">${new Date(Date.parse(data.date))}</small>
               </div>
             </p>
             <div class="update-user-progress buttn">
               <ion-icon name="chatbox-ellipses-outline"></ion-icon>
              <span class="u-number">${data.phone}</span>
             </div>
            `
            if (data.name != undefined) {
                ul.appendChild(li)
                setInterval(() => { getWaitingDuration() }, 3000)
                li.querySelector('.update-user-progress').addEventListener('click', () => {
                    let phone = li.querySelector('.u-number').innerHTML;
                    dom.querySelector('#uus').value = phone;
                    dom.querySelector('.update-u-sms').classList.remove('hide')
                })
                uialertText.innerHTML = 'Visitor has been added!'
                callUIalert()
            }
        }
       


        if (data.type == 'serving') {
            dom.querySelector('.top-serving h5').innerHTML = data.name;
            dom.querySelector('.center-panel .header-box').innerHTML = data.name
            dom.querySelector('.serving-phone').innerHTML = data.phone;
            dom.querySelector('.served-id').innerHTML = data.vsid;
            dom.querySelector('.serve-email').innerHTML = data.email;
            startServingTimer()
             //@Change Button
             dom.querySelector('.call-visitor-v-admin').classList.add('hide')
             dom.querySelector('.finish-visitor-v-admin').classList.remove('hide')
            queryQueue()
            const clearUL = () => {
                let ulDom = dom.querySelectorAll('#queue-holder li')
                let domArrays = Array.from(ulDom)
                console.log(domArrays.length);
                if (domArrays.length == 1) {
                    dom.querySelector('#queue-holder').innerHTML = ''
                }
            }
            clearUL()
        }

        if (data.type == 'finished') {
            dom.querySelector('.call-visitor-v-admin').classList.remove('hide')
            dom.querySelector('.finish-visitor-v-admin').classList.add('hide')
            clearInterval(intId)
        }
    }

    console.log(data);
    if (dom.querySelector('.join-queue-vp__form')) {
        updateCounter(data)
    }
}

if (dom.querySelector('.add-v-via-admin__form')) {
    const uVisitorForm = dom.querySelector('.add-v-via-admin__form')
    uVisitorForm.addEventListener('submit', (e) => {

    const closeOverlayEls = () => {
        uVisitorForm.classList.add('hide')
        dom.querySelector('.global-overlay').classList.add('hide')
    }
    e.preventDefault()

    fetch('/add-vistor', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            locid: uVisitorForm['locid'].value,
            place: uVisitorForm['place'].value,
            firstname: uVisitorForm['firstname'].value,
            phone: uVisitorForm['phone'].value.replace(/\D/g, ''),
            labels: uVisitorForm['labels'].value
        })
    }).then((res) => {
        return res.json()
    }).then(res => {
            closeOverlayEls()              
        socket.emit('emiting', {
                type: 'added',
                name: res.user.firstname,
                phone: res.user.phone,
                id: res.user._id,
                label: res.user.labels,
                status: res.user.status,
                line: res.user.line,
                date: res.user.date,
                place: res.user.place
        })
     })
})
}






//@Update Counter on Visitors page load
window.addEventListener('DOMContentLoaded', () => {
    if (dom.querySelector('.join-queue-vp__form')) {
        socket.emit('emiting', 'Hello')

        //@Hide el if filled
        const maxmumber = dom.querySelector('.maximun-visitor')
        const realV = dom.querySelector('.poqt-counter')

        if (parseInt(realV.innerHTML, 10) >= parseInt(maxmumber.innerHTML, 10)) {
            dom.querySelector('.maxnum-vfilled').style.display = 'none'
            dom.querySelector('.green-tag').innerHTML = 'Currently unvailable'
            dom.querySelector('.green-tag').style.backgroundColor = '#ff3860'
            dom.querySelector('.show-join-queue__form').classList.add('hide')
        }
    }

    if (dom.querySelector('.left-service-top')) {
        const filter = document.querySelector('#filter')
        const preferedId = document.querySelector('input[name=locid]')
        const locationName = dom.querySelector('input[name=place]')

        filter.addEventListener('change', () => {
            preferedId.value = filter.value;
            locationName.value = filter.options[filter.selectedIndex].innerHTML
            queryQueue()
        })
      
         preferedId.value = filter.value;
        locationName.value = filter.options[filter.selectedIndex].innerHTML
        queryQueue()
    }

    if (dom.querySelector('.date-filt-container')) {
        selectTodayfilter()
    }
})





//@For Appointment booking page on Frontend

if (dom.querySelector('.time-reveal-bp')) {
    dom.querySelectorAll('.slots-time-db').forEach((time) => {
        let timeholder = dom.querySelector('#timehd')
        let timeReveal = dom.querySelector('.time-reveal-bp')
           time.addEventListener('click', () => {
               timeholder.value = `${time.innerHTML}`
               timeReveal.innerHTML = timeholder.value
           })
       })
   
    //    const apptCheckerForm =  dom.querySelector('.appt-checker-inner')
    //    dom.querySelector('.open-checker').addEventListener('click', (e) => {
   
    //        e.preventDefault()
    //        if(apptCheckerForm.classList.contains('hide')){
    //            apptCheckerForm.classList.remove('hide')
    //        } else {
    //            apptCheckerForm.classList.add('hide')
    //        }
    //    })
}




//@On Admin side // Appointement

if (dom.querySelector('.add-b-url')) {
    const bookingURL = dom.querySelector('.booking-url-form #link');
    const bookingUrlForm = dom.querySelector('.booking-url-form')
    let overlayOnAppt = dom.querySelector('.global-overlay')
    

    //@ Booking page URL Add '-' on every space
    bookingURL.addEventListener('keyup', () => {
    bookingURL.value = bookingURL.value.replace(/\s+/g, '-').toLowerCase(); 
})


overlayOnAppt.addEventListener('click', () => {
    bookingUrlForm.classList.add('hide')
    overlayOnAppt.classList.add('hide')
    document.querySelectorAll('.booking-actions').forEach(uaf => {
        uaf.classList.add('hide')
    })
})

dom.querySelector('.add-b-url').addEventListener('click', (e) => {
    e.preventDefault()
    bookingUrlForm.classList.remove('hide')
    overlayOnAppt.classList.remove('hide')
})

dom.querySelectorAll('.u-booking-actions').forEach(uactions => {
    uactions.addEventListener('click', (e) => {
        e.preventDefault()

        overlayOnAppt.classList.remove('hide')
        uactions.nextElementSibling.classList.remove('hide')
    })
})
}



//@Slot page



//@Booking page Filter function
if (dom.querySelector('.date-filt-container')) {
    let dateFiltContainer = document.querySelector('.date-filt-container')

//@Open Filter Container
dom.querySelector('.call-appt-filter').addEventListener('click', (e) => {
    e.preventDefault()
    dateFiltContainer.classList.remove('hide')
})

//@Close Filter Container
dom.querySelector('.u-close-date__filter').addEventListener('click', (e) => {
    e.preventDefault()
    dateFiltContainer.classList.add('hide')

})



        //@On Change
        const apptQ = document.querySelector('#date-filt')

    
        function selectTodayfilter() {
            document.querySelectorAll('.booking-grid .cc').forEach(col => {
                col.classList.add('hide')
            })
            document.querySelectorAll('.u-book-date').forEach((uidate) => {
                const isFiltered = () => {
                    let _1stSib = uidate.previousElementSibling;
                    let _2ndSib = _1stSib.previousElementSibling;
                    let _3rdSib = _2ndSib.previousElementSibling;
                    let _4thSib = _3rdSib.previousElementSibling;
                    let _5thSib = _4thSib.previousElementSibling;
                    let _6thSib = _5thSib.previousElementSibling;
        
                    //@Remove Class
                    _1stSib.classList.remove('hide')
                    _2ndSib.classList.remove('hide')
                    _3rdSib.classList.remove('hide')
                    _4thSib.classList.remove('hide')
                    _5thSib.classList.remove('hide')
                    _6thSib.classList.remove('hide')
                
                    //@Nexted
                    _1stSib.querySelector('.u-booking-actions').classList.remove('hide')
                    _1stSib.querySelector('.status')
                }
        
            
                let date = new Date(uidate.innerHTML)
                let momentO = moment(date)
                let momentB = momentO.format('YYYY-MM-DD')
                let days = moment().diff(momentB, 'days');
              
                 if (apptQ.value == date.getDate() && apptQ.options[apptQ.selectedIndex].innerHTML == 'Today') {
                     isFiltered() 
                }
            })
            
        }    
        
        apptQ.addEventListener('change', (e) => {
        dom.querySelectorAll('.booking-grid .cc').forEach(col => {
            col.classList.add('hide')
        })
        
        document.querySelectorAll('.u-book-date').forEach((uidate) => {
        
            const isFiltered = () => {
                let _1stSib = uidate.previousElementSibling;
                let _2ndSib = _1stSib.previousElementSibling;
                let _3rdSib = _2ndSib.previousElementSibling;
                let _4thSib = _3rdSib.previousElementSibling;
                let _5thSib = _4thSib.previousElementSibling;
                let _6thSib = _5thSib.previousElementSibling;
        
                //@Remove Class
                _1stSib.classList.remove('hide')
                _2ndSib.classList.remove('hide')
                _3rdSib.classList.remove('hide')
                _4thSib.classList.remove('hide')
                _5thSib.classList.remove('hide')
                _6thSib.classList.remove('hide')
            
                //@Nexted
                _1stSib.querySelector('.u-booking-actions').classList.remove('hide')
                _1stSib.querySelector('.status')
            }
        
        
            
        
            let date = new Date(uidate.innerHTML)
            let momentO = moment(date)
            let momentB = momentO.format('YYYY-MM-DD')
            let days = moment().diff(momentB, 'days');
            let week = moment().diff(momentB, 'weeks');
            let thisWeek = moment(momentO).isSame(new Date(), 'week')
           // console.log(date.getDate());
            if(apptQ.value == week){
                isFiltered()
            } else if(apptQ.value == 'all'){
                isFiltered()
            } else if(apptQ.value == date.getDate() && apptQ.options[apptQ.selectedIndex].innerHTML == 'Today'){
                isFiltered()
            } 
            
        
        })  
        })


    
}


socket.on('appt', apptChecked)



function apptChecked(user) {
    //@User End
     if (dom.querySelector('.appt-signup__form')) {
        
         if (user.good != undefined) {
                uialertText.innerHTML = 'Location owner has been alerted!'
                callUIalert()
         }

         if (user.error != undefined) {
            uiAlert.innerHTML = 'Opps! The number and/or email you inserted does not match what you booked the appointment with.'
            callUIalert()
         }

 }

    if (dom.querySelector('.booking-url-form')) {
        if (user.good != undefined) {
            uialertText.innerHTML =  `${user.good.name} who has an appointment at ${user.good.time} has checked in`;
            callUIalert()
            setTimeout(() => { location.reload() }, 2000);
     }
    }
    
}

// if(dom.querySelector('.appt-checker-inner')){
// const apptCheckerForm = dom.querySelector('.bapt-client')
//     apptCheckerForm.addEventListener('submit', (e) => {

//         e.preventDefault()

//         fetch('/check-appt-client', {
//             method: 'post',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 emailid: apptCheckerForm['emailid'].value,
//                 email: apptCheckerForm['email'].value,
//                 phone: apptCheckerForm['phone'].value
               
//             })
//         }).then((res) => {
//             return res.json()
//         }).then(res => {
//             socket.emit('appt', {
//                 good: res.good,
//                 error: res.error
//             })
//         }) 
//     })


// }




if (dom.querySelector('.appt-signup-btn')) {
    let yr = new Date().getFullYear()  
   let months = new Date().getMonth() + 2
   let dates = new Date().getDate()




 //@If it's Mobile
 if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    new Pikaday({ 
    field: document.getElementById('datepicker'),
    maxDate: new Date(yr, months, dates),
    minDate: new Date(),
 });
} else {
    new Pikaday({ 
    field: document.getElementById('datepicker'),
    numberOfMonths: 2,
    maxDate: new Date(yr, months, dates),
    minDate: new Date(),
 });
}



const apptSignupForm = dom.querySelector('.appt-signup__form')
const apptLoginForm = dom.querySelector('.appt-login__form')
const reserveSpotForm  = dom.querySelector('.appt-reserve-spot')
const confirmClientapptDel = dom.querySelector('.confirm-appt-client-delete')







dom.querySelector('.appt-signup-btn').addEventListener('click', (e) => {
    e.preventDefault()
   apptSignupForm.classList.remove('hide')
})

dom.querySelector('.close-appt-signup').addEventListener('click', () => {
    apptSignupForm.classList.add('hide')
})

dom.querySelector('.appt-login-btn').addEventListener('click', (e) => {
    e.preventDefault()
   apptLoginForm.classList.remove('hide')
})

dom.querySelector('.close-appt-login').addEventListener('click', () => {
    apptLoginForm.classList.add('hide')
})

const switchAuthforms = () => {
    apptSignupForm.classList.add('hide')
    apptLoginForm.classList.remove('hide')
}




const closeLoginForm = () => {
    apptLoginForm.classList.add('hide')
    dom.querySelector('.alert-unauth').classList.add('hide')
}




//Reseve Booking
reserveSpotForm.addEventListener('submit', (e) => {
    e.preventDefault()

    fetch('/reverse-space', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                emailid: reserveSpotForm['emailid'].value,
                name: reserveSpotForm['name'].value,
                email: reserveSpotForm['email'].value,
                phone: reserveSpotForm['phone'].value,
                time: reserveSpotForm['time'].value,
                location: reserveSpotForm['location'].value,
                bizname: reserveSpotForm['bizname'].value,
                url: reserveSpotForm['url'].value,
                rdate: reserveSpotForm['rdate'].value
            })
        }).then((res) => {
            return res.json()
        }).then(res => {
            if(res.data){
                callUIalert()
                uialertText.innerHTML = 'Your booking was successful!'

                //@Empty time values
                dom.querySelector('#timehd').value = ''
                dom.querySelector('.time-reveal-bp').innerHTML = 'No slot selected'
                document.getElementById('datepicker').value = ''
                //@Fill User infos
                let ul = dom.querySelector('#user-bookings')
                let li = document.createElement('li')

                res.data.book.forEach(bookings => {
                    li.innerHTML = `
                    <span class="rdate">${bookings.rdate}</span>
                    <span class="status ${bookings.status}">${bookings.status}</span>

                    <span class="bizname">${bookings.bizname}</span>
                    <span class="time">${bookings.time}</span>
                    <span class="location">${bookings.location}</span>
                   
                    <span class="del" id="${bookings._id}">
                        <form class="del-appt-client__form">
                            <input type="hidden" name="id" value="${bookings.oneid}">
                            <input type="hidden" name="ref" value="${bookings.ref}">
                            <input type="hidden" name="uemail" value="${reserveSpotForm['email'].value}">
                            <button type="submit"><ion-icon name="trash-outline"></ion-icon></button>
                        </form>  
                    </span>
                    <a href="#" class="url" id="${bookings.oneid}"><ion-icon name="notifications-outline"></ion-icon></a>
                    `
                })
                ul.appendChild(li)
                document.querySelector('#appt-number').innerHTML = document.getElementById('user-bookings').getElementsByTagName("li").length;
                    const apptDelForm = li.querySelector('.del-appt-client__form')
                    apptDelForm.addEventListener('submit', (e) => {
                       e.preventDefault()


                        //@Delete Appt Client and Admin
                        fetch('/delete-appt-client', {
                            method: 'post',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                id: apptDelForm['id'].value,
                                ref: apptDelForm['ref'].value,
                                uemail: apptDelForm['uemail'].value
                            })
                        }).then(res => {
                            if(res.status === 200){
                              callUIalert()
                              uialertText.innerHTML = 'Appointment deleted!'
                              ul.removeChild(apptDelForm.closest('li'))  
                              dom.querySelector('#appt-number').innerHTML = document.getElementById('user-bookings').getElementsByTagName("li").length;
                            }
                        })
                    })


                 window.scrollTo(0,document.body.scrollHeight);

                //@Alert Biz Owner
                const apptURL = li.querySelector('.url')
                let ctime = li.querySelector('.time').innerHTML
                let cstatus = li.querySelector('.status')
                  apptURL.addEventListener('click', (e) => {
                    e.preventDefault()
                    fetch('/check-appt-client', {
                        method: 'post',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            emailid: reserveSpotForm['emailid'].value,
                            email: reserveSpotForm['email'].value,
                            phone: reserveSpotForm['phone'].value,
                            id: apptURL.id,
                            time: ctime,
                            name: reserveSpotForm['name'].value
                        })
                    }).then((res) => {
                        return res.json()
                    }).then(res => {
                        socket.emit('appt', {
                            good: res.good,
                            error: res.error
                        })
                        if (res.good) {
                            cstatus.classList.remove('scheduled')
                            cstatus.classList.add('online')
                            cstatus.innerHTML = 'ONLINE'
                        }
                    })
                })
            }
            
            if(res.err){
                const errmsg = dom.querySelector('.error-reserve')
                errmsg.innerHTML = res.err
                errmsg.classList.add('red-tag')
            }
            
        })
})

//@Disable Values
reserveSpotForm['name'].disabled = true
reserveSpotForm['email'].disabled = true
reserveSpotForm['phone'].disabled = true







//@Signup
apptSignupForm.addEventListener('submit', (e) => {
    e.preventDefault()

    fetch('/u/register-appt-user', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: apptSignupForm['email'].value,
                fullname: apptSignupForm['fullname'].value,
                phone: apptSignupForm['phone'].value.replace(/\D/g, ''),
                password: apptSignupForm['password'].value
          })
        }).then((res) => {
            return res.json()
        }).then(res => {
            if(res.user){
                callUIalert()
                uialertText.innerHTML = 'Your registration was successful!'
                setTimeout(() => { switchAuthforms() }, 4000);
            }
            if(res.msg){
                apptSignupForm.querySelector('p').innerHTML = res.msg[0].msg
            }
        })
})



apptLoginForm.addEventListener('submit', (e) => {
    e.preventDefault()

    fetch('/u/login-appt-user', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: apptLoginForm['email'].value,
                password: apptLoginForm['password'].value
            })
        }).then((res) => {
            return res.json()
        }).then(res => {
            if(res.user){
                //@Set Values
                 reserveSpotForm['name'].value = res.user.fullname
                 reserveSpotForm['email'].value = res.user.email
                 reserveSpotForm['phone'].value = res.user.phone

                //@Change Navbar Items
                dom.querySelector('.profile-buttons').classList.add('hide')
                let userProfile = document.querySelector('.dynamic-ui-profile')
                userProfile.innerHTML = `Hi, ${res.user.fullname}`
                userProfile.classList.remove('hide')

                 //@Close Login form
                 closeLoginForm()

                   //@Fill User infos
                let ul = dom.querySelector('#user-bookings')
                res.user.book.forEach(bookings => {
                    let li = document.createElement('li')

                    li.innerHTML = `
                    <span class="rdate">${bookings.rdate}</span>
                    <span class="status ${bookings.status}">${bookings.status}</span>

                    <span class="bizname">${bookings.bizname}</span>
                    <span class="time">${bookings.time}</span>
                    <span class="location">${bookings.location}</span>
                   
                    <span class="del" id="${bookings._id}">
                        <form class="del-appt-client__form">
                            <input type="hidden" name="id" value="${bookings.oneid}">
                            <input type="hidden" name="ref" value="${bookings.ref}">
                            <input type="hidden" name="uemail" value="${res.user.email}">
                            <button type="submit"><ion-icon name="trash-outline"></ion-icon></button>
                        </form>  
                    </span>
                    <a href="#" class="url" id="${bookings.oneid}"><ion-icon name="notifications-outline"></ion-icon></a>
                    `
                    ul.appendChild(li)
                    document.querySelector('#appt-number').innerHTML = document.getElementById('user-bookings').getElementsByTagName("li").length;
                    const apptDelForm = li.querySelector('.del-appt-client__form')
                    apptDelForm.addEventListener('submit', (e) => {
                       e.preventDefault()

                        //@Delete Appt Client and Admin
                        fetch('/delete-appt-client', {
                            method: 'post',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                id: apptDelForm['id'].value,
                                ref: apptDelForm['ref'].value,
                                uemail: apptDelForm['uemail'].value
                            })
                        }).then(res => {
                            if(res.status === 200){
                              callUIalert()
                              uialertText.innerHTML = 'Appointment deleted!'
                              ul.removeChild(apptDelForm.closest('li'))  
                              dom.querySelector('#appt-number').innerHTML = document.getElementById('user-bookings').getElementsByTagName("li").length;
                            }
                        })
                        
                    })

                    
                    //@Alert Biz Owner
                    const apptURL = li.querySelector('.url')
                    let ctime = li.querySelector('.time').innerHTML
                      apptURL.addEventListener('click', (e) => {
                        e.preventDefault()
                        fetch('/check-appt-client', {
                            method: 'post',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                emailid: reserveSpotForm['emailid'].value,
                                email: reserveSpotForm['email'].value,
                                phone: reserveSpotForm['phone'].value,
                                id: apptURL.id,
                                time: ctime,
                                name: reserveSpotForm['name'].value
                            })
                        }).then((res) => {
                            return res.json()
                        }).then(res => {
                            socket.emit('appt', {
                                good: res.good,
                                error: res.error
                            })
                            if (res.good) {
                                cstatus.classList.remove('scheduled')
                                cstatus.classList.add('online')
                                cstatus.innerHTML = 'ONLINE'
                            }
                        })
                    })
                    
                    
                    
                })

                //@Show el on login 
                dom.querySelector('.static-appt').classList.remove('hide-force')
                dom.querySelector('.appt-counter').classList.remove('hide-force')

                //@Show info
                setTimeout(() => {
                    dom.querySelector('.session-info').classList.remove('hide')
                }, 9000);
            }

            //@Error
            if (res.msg) {
                apptLoginForm.querySelector('p').innerHTML = res.msg[0].msg
            }
        })
})



//@Close session info
dom.querySelector('.session-info a').addEventListener('click', (e) => {
    e.preventDefault()
    dom.querySelector('.session-info').classList.add('hide')
})


const perdayOut =  dom.querySelector('#perday-unit')

//@Show and Hide Available Slots
document.getElementById('datepicker').addEventListener('change', (e) => {
    
    const customslotlabel =  document.querySelector('#custom-slot-label')
    customslotlabel.innerHTML = e.target.value
    customslotlabel.className = 'green-tag'
 
      let  trword = e.target.value.replace(/ .*/,'');
 
      function clearDOM(){
        document.querySelectorAll('.slots-time-db').forEach(stdb => {
          stdb.classList.add('hide')
         if(trword == stdb.id){
             stdb.classList.remove('hide')
             let perday = stdb.nextElementSibling;
            if(perday.innerHTML){
                 perdayOut.innerHTML = perday.innerHTML
             }
          }
      })
      }
      clearDOM()
   
      
      //@Empty time values
      dom.querySelector('#timehd').value = ''
      dom.querySelector('.time-reveal-bp').innerHTML = 'No slot selected'
 
      //@Get all bookings
      fetch('/get-bookings', {
         method: 'post',
         headers: {
             'Content-Type': 'application/json'
         },
         body: JSON.stringify({
             emailid: reserveSpotForm['emailid'].value
         })
     }).then((res) => {
         return res.json()
     }).then(res => {
         if(res.data){
            //@Check how many bookings has this at
            let limit = parseInt(perdayOut.innerHTML)
            const results = Array.from(res.data.book)

            let goodResults =  results.filter((el => {
                return el.rdate === customslotlabel.innerHTML
            }))

           
            let names = goodResults
            let uniq = names
                    .map((name) => {
                        return {
                        count: 1,
                        name: name.time
                        }
                    })
                    .reduce((a, b) => {
                        a[b.name] = (a[b.name] || 0) + b.count
                        return a
                    }, {})

                    let duplicates = Object.keys(uniq).filter((a) => uniq[a] === limit)

                 if(duplicates.length === 1){
                    dom.querySelectorAll('.slots-time-db').forEach(slotDB => {
                       if(slotDB.id == trword){
                            if(slotDB.innerHTML == duplicates[0]){
                                slotDB.className = 'grey-out'
                                slotDB.disabled = true
                            }
                        } 
                    }) 
                 } else {
                        dom.querySelectorAll('.grey-out').forEach(prevDisabled => {
                        prevDisabled.className = 'slots-time-db'
                        prevDisabled.disabled = false
                        clearDOM()
                   })
                 }

         }
         
     })
})
    
}


