var CA_API_VERSION = '1.2.5';
class CA_API {
	constructor(conf = {}){
		this.current_user = null;
		this.debug = false;
		this.isAdsense = false;
		this.isAdReady = false;
		this.ima_adtag = ''; // deprecated
		this.imasdk; // deprecated
		this.last_shown;
		if(conf.debug){
			this.debug = true;
		}
		this.send('get_ad_config').then((result)=>{
			if(result){
				let self = this;
				let data = JSON.parse(result);
				if(data){
					if(data.status === 'active'){
						if(data.h5_client_id && data.h5_client_id.length > 8){
							this.isAdsense = true;
							this.log('Ad configured');
							// Create the external script element
							let externalScript = document.createElement('script');
							externalScript.async = true;
							externalScript.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client="+data.h5_client_id;
							externalScript.crossOrigin = "anonymous";
							externalScript.onload = function() {
								self.isAdReady = true;
								self.log('Ad ready');
							};
							document.head.appendChild(externalScript);
							// Create the inline script element
							let inlineScript = document.createElement('script');
							inlineScript.textContent = `
								window.adsbygoogle = window.adsbygoogle || [];
								const adBreak = adConfig = function(o) { adsbygoogle.push(o); }
							`;
							document.head.appendChild(inlineScript);
						} else {
							console.log('ERR 717');
						}
					}
				}
			}
		});
	}
	submit_score(val){
		if(val){
			val = Number(val);
			val = btoa((val/1.33));
			let wait = new Promise((res) => {
				this.send('submit', val).then((result)=>{
					if(result){
						this.log('SUBMIT SCORE');
						res(result);
					} else {
						this.log('FAILED SUBMIT SCORE');
						res(false);
					}
				});
			});
			return wait;
		}
	}
	send(action, val = 0, conf = null){
		let game_id = this.game_id;
		let cur_url = window.location.href;
		let ref;
		if(cur_url[cur_url.length-1] === '/'){
			ref = cur_url.substring(
				cur_url.indexOf("/games/") + 7, 
				cur_url.length-1
			);
		} else if(cur_url.substr(cur_url.length-5, cur_url.length) === '.html') {
			ref = cur_url.substring(
				cur_url.indexOf("/games/") + 7, 
				cur_url.lastIndexOf("/index.html")
			);
		}
		let wait = new Promise((res) => {
			let params = 'action='+action+'&value='+val+'&ref='+ref;
			if(conf){
				params += '&conf='+conf;
			}
			let xhr = new XMLHttpRequest();
			xhr.open('POST', '/includes/api.php', true);
			xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xhr.onload = function() {
				if (xhr.status === 200) {
					if(xhr.responseText != 'ok'){
						try {
							JSON.parse(xhr.responseText);
						} catch {
							console.warn('CA Error/Fail');
							console.log(xhr.responseText);
						}
					}
					res(xhr.responseText);
				}
				else {
					res(false);
				}
			}.bind(this);
			xhr.onerror = function() {
				res(false);
			}
			xhr.send(params);
		});
		return wait;
	}
	get_current_user(){
		let wait = new Promise((res) => {
			this.send('get_current_user').then((result)=>{
				if(result){
					this.current_user = JSON.parse(result);
					res(result);
				} else {
					res(false);
				}
			});
		});
		return wait;
	}
	get_user_score(){
		let wait = new Promise((res) => {
			this.send('get_user_score').then((val)=>{
				if(!isNaN(val)){
					res(Number(val));
				}
			});
		});
		return wait;
	}
	get_score_rank(){
		let wait = new Promise((res) => {
			this.send('get_score_rank').then((val)=>{
				if(!isNaN(val)){
					res(Number(val));
				}
			});
		});
		return wait;
	}
	get_scoreboard(conf){
		let wait = new Promise((res) => {
			this.send('get_scoreboard', 0, JSON.stringify(conf)).then((val)=>{
				if(val){
					res(val);
				} else {
					this.log('FAILED GET LEADERBOARD');
					res(false);
				}
			});
		});
		return wait;
	}
	log(msg = ''){
		if(this.debug){
			console.log('CA: '+msg);
		}
	}
	prepare_ad_element(){
		let div = document.getElementById('CA_AD');
		if(!div){
			let link = document.createElement('link');
			link.rel = 'stylesheet';
			link.href = '/admin/style/api.css';
			document.head.appendChild(link);
			let elem = document.createElement('div');
			elem.id = 'CA_AD';
			document.body.appendChild(elem);
		}
		let html = '<div class="popbox">';
		html += '<div class="popup-overlay">';
		html += '<div class="pop-content">';
		html += '<div id="ad-content">';
		html += '<div class="ad-loader"></div>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
		html += '</div>';
		document.getElementById("CA_AD").innerHTML = html;
	}
	show_ad_element(val){
		if(val.type == 'banner'){
			let div = document.getElementById('ad-content');
			let html = '<a href="'+val.url+'" target="_blank" onclick="ca_api.ad_clicked(\''+val.name+'\')" id="banner-link">';
			//html += '<img class="banner-content" src="'+val.value+'" id="banner-content">';
			html += '</a>';
			html += '<div id="ca_b_close">';
			if(!val.delay){
				html += '<button class="popbox-close-button" onclick="ca_api.close_ad()"></button>';
			}
			html += '</div>';
			html += '<div id="ad-delay"></div>';
			div.innerHTML = html;
			let img_banner = document.createElement("img");
			img_banner.src = val.value;
			img_banner.id = 'banner-content';
			img_banner.classList.add('banner-content');
			img_banner.onload = function() {
				document.getElementById('banner-link').append(this);
				make_banner_fit();
			}
			if(val.delay){
				document.getElementById('ad-delay').innerHTML = 'Wait '+(val.delay)+' seconds';
				let count = 0;
				let interval = setInterval(()=>{
					count++;
					document.getElementById('ad-delay').innerHTML = 'Wait '+(val.delay-count)+' seconds';
					if(count >= val.delay){
						document.getElementById('ad-delay').innerHTML = '';
						document.getElementById('ca_b_close').innerHTML = '<button class="popbox-close-button" onclick="ca_api.close_ad()"></button>';
						clearInterval(interval);
					}
				}, 1000);
			}
			function make_banner_fit(){
				let body_width = document.body.clientWidth;
				if(document.getElementById('banner-content').clientWidth > body_width){
					document.getElementById('banner-content').style.width = body_width+"px";
				}
			}
		} else if(val.type == 'ima'){
			if(val.value != ''){
				if(!this.isAdsense){
					this.isAdsense = true;
					// removed
				} else {
					show_ads(this);
				}
			} else {
				this.log('IMA AD Tag is empty.');
				this.on_ad_error();
				this.remove_ad();
			}
		}
		function show_ads(scope){
			if(this.isAdsense){
				//
			} else {
				if(document.getElementById('ca-ads')){
					document.getElementById('ca-ads').style.display = 'block';
				}
				// if(!scope.imasdk){
				// 	scope.imasdk = new Application;
				// }
				// scope.imasdk.showAds();
			}
				
		}
	}
	showAd(){
		if(this.isAdsense && this.isAdReady){
			if(this.last_shown){
				let time_gap = Math.floor((Date.now() - this.last_shown) / 1000);
				if(time_gap < 60){ // 1 minute
					this.log('AD CANCELED, TOO FREQUENT');
					return;
				}
			}
			this.last_shown = Date.now();
			let self = this;
			adBreak({
				type: '-',
				name: '-',
				beforeAd: () => { self.beforeAd(); },  // You may also want to mute the game's sound.
				afterAd: () => { self.afterAd(); },    // resume the game flow.
			});
		}
	}
	show_ad(tag = null){
		// Old method, deprecated
		if(this.last_shown){
			let time_gap = Math.floor((Date.now() - this.last_shown) / 1000);
			if(time_gap < 120){
				this.log('AD CANCELED, TOO FREQUENT');
				return;
			}
		}
		this.last_shown = Date.now();
		this.log('TRIGGER SHOW AD');
		this.paused();
		this.on_ad_trigger();
		this.prepare_ad_element();
		let wait = new Promise((res) => {
			this.send('load_ad', tag).then((val)=>{
				this.on_ad_start();
				if(val){
					try {
						this.log('AD TAG LOADED');
						val = JSON.parse(val);
						if(val.error){
							this.log(val.error);
							this.on_ad_error();
							this.remove_ad();
							res(false);
						} else if(val.value == ''){
							this.log('Ad/tag value is empty');
							this.on_ad_error();
							this.remove_ad();
							res(false);
						} else {
							this.show_ad_element(val);
							res(val);
						}
					} catch (err) {
						console.log(err);
						this.log('AD FAILED TO PARSE');
						this.on_ad_error();
						this.remove_ad();
						res(false);
					}
				} else {
					this.log('AD FAILED TO LOAD TAG');
					this.on_ad_error();
					this.remove_ad();
					res(false);
				}
			});
				
		});
		return wait;
	}
	ad_clicked(name){
		//Or banner clicked
		this.send('ad_clicked', name);
	}
	close_ad(){
		this.log('AD CLOSED BY PLAYER');
		this.remove_ad();
		this.on_ad_closed();
	}
	remove_ad(){
		if(document.getElementById('CA_AD')){
			document.getElementById('CA_AD').innerHTML = '';
		}
		if(document.getElementById('ca-ads')){
			document.getElementById('ca-ads').style.display = 'none';
		}
		this.on_ad_end();
		this.resume();
	}
	// Callbacks
	beforeAd(){
		// Set from game code
		// Called before the Ad begin to shown
		// Used to pause game, mute.etc
	}
	afterAd(){
		// Set from game code
		// Called after the Ad shown / closed
		// Used to resume game, unmute.etc
	}
	paused(){
		//
	}
	resume(){
		//
	}
	on_ad_trigger(){
		//
	}
	on_ad_start(){
		//
	}
	on_ad_end(){
		//
	}
	on_ad_closed(){
		// Ad closed or skipped by Player
	}
	on_ad_finished(){
		// Used for Adsense
	}
	on_ad_error(e){
		//
	}
	
}
console.log('CA API v'+CA_API_VERSION+' loaded!');

const ca_api = new CA_API;