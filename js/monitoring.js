const monitoring = {
  servers: [{
    address: "mc.chupacraft.ru",
    name: "ChupaCraft",
    }, {
    address: "mineverse.com",
    name: "Mineverse",
  }, {
    address: "mc.hypixel.net",
    name: "Hypixel",
  }, {
    address: "main-pixel.ru",
    name: "Main-Pixel",
  }, {
    address: "play.lastcraft.net",
    name: "LastCraft",
  }, {
    address: "mc.litecloud.me",
    name: "LiteCloud",
  }],
  total: {
    name: "Total Online"
  },
  reset() {
    for (let i = 0; i < this.servers.length; i++) {
      this.servers[i].online = 0;
      this.servers[i].max_online = 0;
      document.getElementById(`server${i}`).innerHTML = this.loadingHtml(this.servers[i]);
    }
    this.total.servers_loaded = 0;
    this.updateTotal();
  },
  updateTotal() {
    let myTotal;
    if (this.total.servers_loaded < this.servers.length) {
      myTotal = this.loadingHtml(this.total);
    } else {
      let totalCurrent = 0,
        totalMax = 0;
      for (let i = 0; i < this.servers.length; i++) {
        totalCurrent += this.servers[i].online;
        totalMax += this.servers[i].max_online;
      }
      var total_data = {
        players: {
          now: totalCurrent,
          max: totalMax,
        }
      };
      myTotal = this.onlineHtml(this.total, total_data);
    }
    document.getElementById("globalOnline").innerHTML = myTotal;
  },
  update() {
    this.reset();
    for (let i = 0; i < this.servers.length; i++) {
      this.updateServerState(i);
    }
    this.updateTotal();
  },
  updateServerState(serverId) {
    let server = this.servers[serverId];
    let serverUrl = `https://mcapi.us/server/status?ip=${server.address}` + (server.port ? `&port=${server.port}` : "");
    let xhr = new XMLHttpRequest();
    xhr.open("GET", serverUrl, true);
    xhr.responseType = "json";
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        let status = xhr.status;
        if (status == 200) {
          let data = xhr.response;
          let serverStatus = (data.last_online) ? monitoring.onlineHtml(server, data) : monitoring.offlineHtml(server, data);
          document.getElementById(`server${serverId}`).innerHTML = serverStatus;
          if (!data.error) {
            server.online = 1 * data.players.now;
            server.max_online = 1 * data.players.max;
          }
          monitoring.total.servers_loaded++;
        } else {
          let error = `<div class="progress-mon"><div class="progress-bar-mon progress-bar-danger-mon" role="progressbar-mon" style="width:100%;"></div>
<div class="progress-text-mon">
<div class="left-mon"><a target="_blank" href="${server.url}">${server.name}</a></div>
<div class="right-mon">Error</div>
</div>`;
          document.getElementById(`server${serverId}`).innerHtml = error;
          monitoring.total.servers_loaded++;
        }
        monitoring.updateTotal();
      }
    };
    xhr.send();
  },
  // Templates
  // List of variables from this API: https://mcapi.us/#usage
  loadingHtml(server) {
    let loading = `<div class="progress-mon progress-striped-mon active"><div class="progress-bar-mon progress-bar-info-mon" role="progressbar" style="width:100%;"></div>
<div class="progress-text-mon">
<div class="left-mon">${server.name}</a></div>
<div class="right-mon">Loading...</div></div>`;
    return loading;
  },
  onlineHtml(server, data) {
    let percentage = data.players.max > 0 ? 100.0 * data.players.now / data.players.max : 0;
    let online = `<div class="progress-mon"><div class="progress-bar-mon" role="progressbar" style="width:${percentage}%;"></div>
<div class="progress-text-mon">
<div class="left-mon">${server.name}</a></div>
<div class="right-mon">${data.players.now}/${data.players.max}</div></div>`;
    return online;
  },
  offlineHtml(server, data) {
    let offline = `<div class="progress-mon"><div class="progress-bar-mon progress-bar-danger-mon" role="progressbar" style="width:100%;"></div>
<div class="progress-text-mon">
<div class="left-mon">${server.name}</a></div>
<div class="right-mon">` + (data.error ? `${data.error}` : "Unavailable") + `</div>
</div>`;
    return offline;
  }
};

monitoring.update();

function refreshBtn() {
  monitoring.reset();
  document.getElementById("mon-refresh").style.pointerEvents = "none";
  document.getElementById("mon-refresh").innerHTML = '<i class="fa fa-spinner"></i> Wait...';
  let refreshTimeout = setTimeout(function() {
    monitoring.update();
    document.getElementById("mon-refresh").style.pointerEvents = "";
    document.getElementById("mon-refresh").innerHTML = '<i class="fa fa-refresh"></i> Refresh';
    clearTimeout(refreshTimeout);
  }, 2000);
}
