function makeStr(num) {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (let i = 0; i < num; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function toggleClass(s,n) {
  let elements = document.querySelectorAll(s);
  elements.forEach(element => {
    element.classList.toggle(n)
  });
}

function switchCategory(e) {
  if(e.target && e.target.nodeName === "LI") {
    let catValue =  e.target.dataset.value;
    switch (catValue) {
      case "0":
      case "1":
        if(catValue === "0") {
          e.target.textContent = '开灯';
          e.target.dataset.value = 1;
          localStorage.setItem('dark', 1);
        } else {
          e.target.textContent = '关灯';
          e.target.dataset.value = 0;
          localStorage.setItem('dark', 0);
        }
        toggleClass('li','white');
        toggleClass('button','white');
        toggleClass('input','white');
        toggleClass('footer','white');
        toggleClass('a','white');
        toggleClass('body','bgBlack');
        toggleClass('input','bgBlack');
        toggleClass('footer','hidden');
        break;
      default:
        if (e.target.dataset.source) {
          programId = catValue;
          playVideo();
          const selected = document.querySelector('.selected');
          if(selected) selected.classList.remove('selected');
          e.target.classList.add('selected');
        } else {
          const mylist = document.querySelector('.'+catValue);
          let siblings = mylist.parentNode.childNodes;
          siblings.forEach(sibling => {
            if(sibling.nodeName === "UL") {
              sibling.classList.add('hidden');
            }
          });
          mylist.classList.remove('hidden');
        }
        break;
    }
  }
}

function switchChannel(e) {
  if(e.target) {
    if (e.target.nodeName === "LI") {
      sourceName =  e.target.dataset.source;
      programId =  e.target.dataset.value;
      playVideo();
      const selected = document.querySelector('.selected');
      if(selected) selected.classList.remove('selected');
      e.target.classList.add('selected');
    } else if (e.target.nodeName === "SUB") {
      sourceName =  e.target.parentNode.dataset.source;
      programId =  e.target.parentNode.dataset.value;
      playVideo();
      const selected = document.querySelector('.selected');
      if(selected) selected.classList.remove('selected');
      e.target.parentNode.classList.add('selected');
    }
  }
}

function videojsLoad() {
  if (videoField.hasChildNodes()) {
    videojs('video').dispose();
  }
  
  let contentType = hlsVideoUrl.indexOf('.m3u8') !== -1 ? 'application/vnd.apple.mpegurl' : 'video/x-flv';
  const video = document.createElement('video');
  video.id = 'video';
  video.className = 'video-js';
  const noVideojs = document.createElement('p');
  noVideojs.className = 'vjs-no-js';
  const noVideojsText = document.createTextNode('需启用 JavaScript，或使用更新的浏览器');
  noVideojs.appendChild(noVideojsText);
  video.appendChild(noVideojs);
  videoField.appendChild(video);

  const player = videojs('video',{
    liveui: liveui,
    autoplay: 'true',
    preload: 'auto',
    playsinline: true,
    textTrackSettings: false,
    controls: true,
    fluid: true,
    responsive: true
  });

  player.src({
    src: hlsVideoUrl,
    type: contentType,
    overrideNative: true
  });

  player.ready(function() {
    let promise = player.play();

    if (promise !== undefined) {
      promise.then(function() {
        // Autoplay started!
      }).catch(function() {
        // Autoplay was prevented.
      });
    }
  });

  player.on('error', function(e) {
    let time = this.currentTime();
    if (this.error().code === 2) {
      alertInfo('频道发生错误！',10);
      this.error(null).pause().load().currentTime(time).play();
    } else if (this.error().code === 4) {
      if (hlsVideoUrl.indexOf('flv?app=') !== -1 && videojs.browser.IS_IOS) {
        alertInfo('此频道不支持 ios 系统！',10);
      /*} else if (videojs.browser.IS_ANDROID) {
        alertInfo('不支持安卓系统！',10);*/
      } else {
        alertInfo('频道不可用！直播源不定时刷新，刷新页面即可继续观看！',10);
      }
    } else {
      alertInfo('无法连接直播源！',10);
    }
  });
}

function playVideo() {
  if(!programId) {
    let keyArr = Object.keys(sourcesJsonParsed);
    let index,source;
    while ((index = keyArr.pop()) !== undefined) {
      if (sourcesJsonParsed[index].hasOwnProperty('channels') && sourcesJsonParsed[index].channels[0] && sourcesJsonParsed[index].channels[0].hasOwnProperty('url')) {
        if (sourcesJsonParsed[index].hasOwnProperty('ios') && videojs.browser.IS_IOS) {
          source = sourcesJsonParsed[index].ios;
        } else if (sourcesJsonParsed[index].hasOwnProperty('android') && videojs.browser.IS_ANDROID) {
          source = sourcesJsonParsed[index].android;
        } else if (sourcesJsonParsed[index].hasOwnProperty('default')) {
          source = sourcesJsonParsed[index].default;
        } else {
          source = sourcesJsonParsed[index].channels[0];
        }
        hlsVideoUrl = source.url;
        videojsLoad();
        if (sourcesJsonParsed[index].hasOwnProperty('overlay')) {
          videoOverlay(sourcesJsonParsed[index].overlay,source);
        }
        showSchedule(source.schedule);
        break;
      }
    }
  } else if (jsonChannels[sourceName]) {
    hlsVideoUrl = jsonChannels[sourceName][programId]['url'];
    videojsLoad();
    if (jsonChannels[sourceName].hasOwnProperty('overlay')) {
      videoOverlay(jsonChannels[sourceName].overlay,jsonChannels[sourceName][programId]);
    }
    showSchedule(jsonChannels[sourceName][programId].schedule);
  } else {
    sourcesJsonParsed[sourceName].channels.forEach(channel => {
      if (channel.chnl_id === programId) {
        hlsVideoUrl = channel.url;
        videojsLoad();
        if (sourcesJsonParsed[sourceName].hasOwnProperty('overlay')) {
          videoOverlay(sourcesJsonParsed[sourceName].overlay,channel);
        }
        showSchedule(channel.schedule);
      }
    });
  }
}

function videoOverlay(sourceOverlay,channel) {
  let overlays = [],channelOverlay,channelOverlayArr = [];
  if (channel.hasOwnProperty('overlay') && channel.overlay.length > 0) {
    channelOverlay = channel.overlay;
    channelOverlayArr = channelOverlay.split(',');
  }
  sourceOverlay.forEach((sourceItem,sourceIndex) => {
    let overlayInfo = [];
    if (sourceItem.hasOwnProperty('force') && sourceItem.force === 1) {
      if (sourceItem.hasOwnProperty('switch') && sourceItem.switch === 'on') {
        overlays.push({class:'overlay'+sourceIndex.toString(),content:'',align:'center',start:'ready'});
        overlayInfo.push(sourceItem.height,sourceItem.width,sourceItem.margin_left,sourceItem.margin_top,sourceItem.height_fullscreen,sourceItem.width_fullscreen,sourceItem.margin_left_fullscreen,sourceItem.margin_top_fullscreen);
        overlaysInfo[sourceIndex] = overlayInfo;
      }
    } else if (channelOverlayArr.length > sourceIndex) {
      let channelOverlayIndex = channelOverlayArr[sourceIndex];
      if ((channelOverlayIndex === 'on' && sourceItem.reverse === 0) || (channelOverlayIndex === 'off' && sourceItem.reverse === 1)) {
        overlays.push({class:'overlay'+sourceIndex.toString(),content:'',align:'center',start:'ready'});
        overlayInfo.push(sourceItem.height,sourceItem.width,sourceItem.margin_left,sourceItem.margin_top,sourceItem.height_fullscreen,sourceItem.width_fullscreen,sourceItem.margin_left_fullscreen,sourceItem.margin_top_fullscreen);
        overlaysInfo[sourceIndex] = overlayInfo;
      } else if (channelOverlayIndex.indexOf(':') !== -1) {
        let channelOverlayIndexArr = channelOverlayIndex.split(':');
        if ((sourceItem.reverse === 0 && channelOverlayIndexArr[0] === 'on') || (sourceItem.reverse === 1 && channelOverlayIndexArr[0] === 'off')) {
          overlays.push({class:'overlay'+sourceIndex.toString(),content:'',align:'center',start:'ready'});
          channelOverlayIndexArr.shift();
          overlaysInfo[sourceIndex] = channelOverlayIndexArr;
        }
      }
    }
  });

  if (overlays.length > 0) {
    videoField.firstChild.classList.add('vjs-16-9');
    videojs('video').overlay({
      debug: false,
      overlays: overlays
    });
    for (let index = 0; index < overlays.length; index++) {
      const info = overlaysInfo[index];
      const overlayIndex = document.querySelector('.overlay'+index);
      overlayIndex.setAttribute('style', 'height:' + info[0] +'%; width: ' + info[1] + '%; margin-left: ' + info[2] + '%; margin-top: ' + info[3] + '%;');
    }
  }
}

function setOverlayFullscreen() {
  let width = window.screen.width * window.devicePixelRatio;
  let height = window.screen.height * window.devicePixelRatio;
  let videoWidth,videoHeight,newWidth,newHeight,marginLeft,marginTop;
  let videoWidthRes = videojs('video').videoWidth();
  let videoHeightRes = videojs('video').videoHeight();
  if (width > height && width / height !== 1.6) {
    videoHeight = height;
    videoWidth = videoHeight * videoWidthRes / videoHeightRes;
  } else {
    videoWidth = width;
    videoHeight = videoWidth * videoHeightRes / videoWidthRes;
  }

  for (let index = 0; index < Object.keys(overlaysInfo).length; index++) {
    const info = overlaysInfo[index];
    const overlayIndex = document.querySelector('.overlay'+index);
    if (overlayIndex) {
      if (document.fullscreenElement) {
        newHeight = Math.floor(videoHeight * info[4] / 100 / window.devicePixelRatio);
        newWidth = Math.floor(videoWidth * info[5] / 100 / window.devicePixelRatio);
        marginLeft = Math.floor(videoWidth * info[6] / 100 / window.devicePixelRatio);
        marginTop = Math.floor(videoHeight * info[7] / 100 / window.devicePixelRatio);
  
        overlayIndex.setAttribute('style', 'width:' + newWidth +'px; height: ' + newHeight + 'px; margin-left: ' + marginLeft + 'px; margin-top: ' + marginTop + 'px;');
      } else {
        overlayIndex.setAttribute('style', 'height:' + info[0] +'%; width: ' + info[1] + '%; margin-left: ' + info[2] + '%; margin-top: ' + info[3] + '%;');
      }
    }
  }
}

function timeoutPromise(ms, promise) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('超时'));
    }, ms);
    promise.then(
      (res) => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      (err) => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  }).catch(console.log);
}

function reqData(url, data = '', method = 'GET') {
  return new Promise((resolve, reject) => {
    if (method === 'GET') {
      fetch(url + data, {
        method: method,
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
        /*referrer: "",*/
      }).then(response => {
        resolve(response.json());
      }).catch(err => {reject(err);});
    } else {
      fetch(url, {
        method: method,
        mode: "cors",
        cache: "no-cache",
        credentials: "omit",
        /*referrer: "",*/
        body: JSON.stringify(data),
      }).then(response => {
        resolve(response.json());
      }).catch(err => {reject(err);});
    }
  }).catch(err => {
    console.log('连接 ' + url + ' 发生错误:', err.message);
  });
}

function alertInfo(text,delay=3) {
  alertField.textContent = text;
  setTimeout(function() {
    if (alertField.textContent === text) {
      alertField.textContent = '';
    }
  }, delay*1000);
}

function appendList(channel,appendSourceName,sourceLane) {
  const channelListItem = document.createElement('li');
  const channelListText = document.createTextNode(channel.chnl_name);
  if (localStorage.getItem('dark') === '1'){
    channelListItem.classList.add('white');
  }
  if (localStorage.getItem(appendSourceName+'_token') || jsonChannels.hasOwnProperty(appendSourceName)){
    channelListItem.classList.add('working');
  }
  channelListItem.setAttribute('data-value',channel.chnl_id);
  channelListItem.setAttribute('data-source',appendSourceName);
  channelListItem.appendChild(channelListText);
  if (channel.chnl_cat.indexOf('高清') === -1) {
    const channelSup = document.createElement('sub');
    channelSup.textContent = sourceLane;
    channelListItem.appendChild(channelSup);
  }
  switch (channel.chnl_cat) {
    case '港澳台':
      myList1.appendChild(channelListItem);
      break;
    default:
      break;
  }
}

function reqJson(json) {
  timeoutPromise(5000,reqData(json))
  .then(response => {
    if (response.ret === 0) {
      response.data.forEach((source) => {
        if (source.hasOwnProperty('channels')) {
          let newChannel={};
          jsonChannels[source.name] = {};
          if (source.hasOwnProperty('overlay')) {
            jsonChannels[source.name]['overlay'] = source.overlay;
          }
          source.channels.forEach(channel => {
            if (channel.hasOwnProperty('url')) {
              jsonChannels[source.name][channel.chnl_id] = {};
              jsonChannels[source.name][channel.chnl_id]['url'] = channel.url;
              if (channel.hasOwnProperty('overlay')) {
                jsonChannels[source.name][channel.chnl_id]['overlay'] = channel.overlay;
              }
              if (channel.hasOwnProperty('schedule')) {
                jsonChannels[source.name][channel.chnl_id]['schedule'] = channel.schedule;
              }
              newChannel.chnl_name = channel.chnl_name;
              newChannel.chnl_id = channel.chnl_id;
              newChannel.chnl_cat = channel.chnl_cat;
              appendList(newChannel,source.name,source.lane);
            }
          });
        }
      });
    }
  }).catch(() => {console.log('无法连接 '+json)});
}

function parseJson(json) {
  let newJson = {};
  json.data.forEach(element => {
    if (element.play_url) {
      const sourcesListItem = document.createElement('li');
      sourcesListItem.textContent = element.desc;
      sourcesListItem.className = 'source_' + element.name;
      if (localStorage.getItem('dark') === '1'){
        sourcesListItem.classList.add('white');
      }
      sourcesField.appendChild(sourcesListItem);
    }

    let newIndex = element.name;
    newJson[newIndex] = element;
  });
  sourcesJsonParsed = newJson;
}

function showSchedule(program) {
  while (scheduleField.firstChild) {
    scheduleField.removeChild(scheduleField.firstChild);
  }

  if (Object.keys(schedules).length === 0 && schedules.constructor === Object) {
    reqData(scheduleJson).then(response => {
      schedules = response;
      insertSchedule(program);
    });
  } else {
    insertSchedule(program);
  }
}

function insertSchedule(program) {
  if (!schedules.hasOwnProperty(program) || schedules[program].length === 0) {
    sliderField.classList.add('hidden');
    return;
  }

  let scheduleTime = 1000000000,indexTime,slideIndex = 0;
  let dateNow = Date.now();

  for (let index = 0; index < schedules[program].length; index++) {
    const schedule = schedules[program][index];
    const scheduleListItem = document.createElement('li');
    const scheduleListText = document.createTextNode(schedule.time + ' ' + schedule.title);
    scheduleListItem.classList.add('js_slide');
    if (schedule.hasOwnProperty('id')) {
      scheduleListItem.setAttribute('data-id', schedule.id);
      scheduleListItem.setAttribute('data-channel', program);
    }
    scheduleListItem.appendChild(scheduleListText);
    scheduleField.appendChild(scheduleListItem);
    indexTime = schedule.sys_time * 1000;
    if (indexTime < dateNow && indexTime > scheduleTime) {
      scheduleTime = indexTime;
      slideIndex = index;
    }
  }

  sliderField.classList.remove('hidden');

  lory(sliderField, {
    initialIndex: slideIndex,
    centerMode: { enableCenterMode: true, firstSlideLeftAlign: true }
  });
}

function scheduleUpcoming(e) {
  if(e.target) {
    if (e.target.nodeName === "LI" && e.target.hasAttribute('data-id') && e.target.hasAttribute('data-channel')) {
      let showId =  e.target.dataset.id;
      let channel = e.target.dataset.channel;
      let hboLink;
      switch (channel) {
        case 'hbo':
          hboLink = 'https://hboasia.com/HBO/zh-cn/ajax/home_schedule_upcoming_showtimes?channel=' + channel + '&feed=cn&id=' + showId;
          break;
        case 'hbotw':
          hboLink = 'https://hboasia.com/HBO/zh-cn/ajax/home_schedule_upcoming_showtimes?channel=hbo&feed=satellite&id=' + showId;
          break;
        case 'hbored':
          hboLink = 'https://hboasia.com/HBO/zh-cn/ajax/home_schedule_upcoming_showtimes?channel=red&feed=satellite&id=' + showId;
          break;
        default:
          hboLink = 'https://hboasia.com/HBO/zh-tw/ajax/home_schedule_upcoming_showtimes?channel=' + channel + '&feed=satellite&id=' + showId;
          break;
      }
      //alertInfo('正在查询官网请稍等...');
      reqData(hboLink)
      .then(response => {
        let dateNow = Date.now();
        const upComingList = document.createElement('ul');
        upComingList.setAttribute('data-id', dateNow);
        const upComingListTitle = document.createTextNode('即將播出:');
        for (let index = 0; index < response.length; index++) {
          const schedule = response[index];
          if (schedule.id) {
            const upComingListItem = document.createElement('li');
            const upComingListText = document.createTextNode(schedule.time);
            upComingListItem.appendChild(upComingListText);
            upComingList.appendChild(upComingListItem);
          }
        }
        if (!upComingList.firstChild) {
          const upComingListItem = document.createElement('li');
          const upComingListText = document.createTextNode('无');
          upComingListItem.appendChild(upComingListText);
          upComingList.appendChild(upComingListItem);
        }
        while (upComingField.firstChild) {
          upComingField.removeChild(upComingField.firstChild);
        }
        upComingField.appendChild(upComingListTitle);
        upComingField.appendChild(upComingList);
        setTimeout(function() {
          if (upComingField.firstChild && upComingField.firstChild.nextSibling.dataset.id === dateNow.toString()) {
            while (upComingField.firstChild) {
              upComingField.removeChild(upComingField.firstChild);
            }
          }
        }, 10000);
      });
    }
  }
}

let programId,sourcesJson,sourcesJsonParsed,jsonChannels = {},hlsVideoUrl,schedules = {},overlaysInfo = {};
let sourceName = 'a3';
let localJson = 'channels.json';
let remoteJson = 'http://hbo.epub.fun/channels.json';
let scheduleJson = 'http://hbo.epub.fun/schedule.json';
const videoField = document.querySelector('.videoContainer');
const formToggle = document.querySelector('.formToggle');
const channelsField = document.querySelector('.channels');
const categoriesField = document.querySelector('.categories');
const switchBtn = document.querySelector('.switch');
const myList1 = document.querySelector('.channels ul:nth-child(1)');
const alertField = document.querySelector('.alert');
const upComingField = document.querySelector('.upComing');
const sliderField = document.querySelector('.js_slider');
const scheduleField = document.querySelector('.slides');

let liveui = true;
/*if (videojs.browser.IS_ANDROID || videojs.browser.IS_IOS) {
  liveui = false;
}*/

reqData(localJson).then(response => {
  if (response.ret === 0) {
    sourcesJson = response;
    parseJson(response);
    initialize();
  } else {
    alertInfo('服务器维护中，请稍后再试！',10);
  }
}).catch(() => {
  console.log('本地频道不存在，尝试连接远程频道...');
  reqData(remoteJson).then(response => {
    if (response.ret === 0) {
      sourcesJson = response;
      parseJson(response);
      initialize();
    } else {
      alertInfo('官网服务器维护中，请稍后再试！',10);
    }
  }).catch(err => {
    console.log('初始化错误:',err.message);
  });
});

function initialize() {
  myList1.textContent = '';
  myList1.classList.add('myList1');

  sourcesJson.data.forEach(source => {
    if (source.hasOwnProperty('json')) {
      reqJson(source.json);
    }
    if (source.hasOwnProperty('channels')) {
      source.channels.forEach(channel => {
        if (channel.hasOwnProperty('chnl_cat')) {
          appendList(channel,source.name,source.lane);
        }
      });
    }
  });

  playVideo();
}

categoriesField.addEventListener("click", switchCategory);
scheduleField.addEventListener("click", scheduleUpcoming);
channelsField.addEventListener("click", switchChannel);
document.addEventListener("fullscreenchange", setOverlayFullscreen);
document.addEventListener("webkitfullscreenchange", setOverlayFullscreen);
document.addEventListener("mozfullscreenchange", setOverlayFullscreen);
document.addEventListener("msfullscreenchange", setOverlayFullscreen);
window.addEventListener("orientationchange", setOverlayFullscreen);

if (localStorage.getItem('dark') === '1'){
  switchBtn.click();
}
