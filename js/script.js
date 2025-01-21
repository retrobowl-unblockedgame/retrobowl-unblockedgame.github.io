"use strict";
var Stats;
var listGames;
var distributor;
class GameList {
	getList(url){
		$('.fetch-loading').css('display', 'block');
		$('.fetch-list').css('display', 'none');
		let wait = new Promise((res) => {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', url);
			xhr.onload = function() {
				if (xhr.status === 200) {
					try {
						let arr = JSON.parse(xhr.responseText);
						res(arr);
					} catch(err) {
						console.log(xhr.responseText);
						res(false);
					}
				}
				else {
					res(false);
				}
			}.bind(this);
			xhr.send();
		});
		return wait;
	}
	generateList(arr){
		listGames = arr;
		let result = '';
		let dom = document.getElementById("gameList");
		let index = 1;
		for(let i=0; i<arr.length; i++){
			result += '<tr id="tr'+(i+1)+'"><th scope="row">'+index+'</th><td><img src="'+arr[i].thumb_2+'" width="60px" height="auto" class="gamelist"></td><td>'+arr[i].title+'</td><td><span class="categories">'+arr[i].category+'</span></td><td><a href="'+arr[i].url+'" target="_blank">Play</a></td><td><span class="actions"><a href="#" onclick="addData('+i+')"><i class="fa fa-plus circle" aria-hidden="true"></i></a></span></td></tr>';
			index++;	
		}
		dom.innerHTML = result;
		$('.fetch-list').css('display', 'block');
		$('.fetch-loading').css('display', 'none');
	}
}
var getGame = new GameList();
function sendRequest(data, reload, action, id){
	let wait = new Promise((res) => {
		$.ajax({
			url: 'request.php',
			type: 'POST',
			dataType: 'json',
			data:data,
			success: function (data) {
				//console.log(data.responseText);
			},
			error: function (data) {
				//console.log(data.responseText);
			},
			complete: function (data) {
				if(reload){
					location.reload();
				}
				if(action === 'edit-page'){
					set_edit_modal(JSON.parse(data.responseText));
				} else if(action === 'edit-game'){
					//set_edit_game_modal(JSON.parse(data.responseText));
				} else if(action === 'edit-category'){
					//set_edit_category_modal(JSON.parse(data.responseText));
				} else if(action === 'edit-collection'){
					set_edit_collection_modal(JSON.parse(data.responseText));
				} else if(action === 'remove'){
					show_action_info(data.responseText);
					$('.fetch-list').removeClass('disabled-list');
					if(id){
						remove_from_list(id-1);
					}
				}
				res(data.responseText);
			}
		});
	});
	return wait;
}
function addData(id){
	$('.fetch-list').addClass('disabled-list');
	let wait = new Promise((res) => {
		let arr = listGames[id];
		let _tags = '';
		if(arr['tags'] && arr['tags'] != ''){
			_tags = arr['tags'];
		}
		let data = {
			action: 'addGame',
			source: distributor,
			title: arr.title,
			thumb_1: arr.thumb_1,
			thumb_2: arr.thumb_2,
			description: arr.description,
			url: arr.url,
			instructions: arr.instructions,
			width: arr.width,
			height: arr.height,
			category: arr.category,
			is_mobile: (arr.is_mobile) ? true : false,
			tags: _tags,
		}
		sendRequest(data, false, 'remove', id+1).then((result)=>{
			let status = result.slice(0, 5);
			if(status === 'added' || status === 'exist'){
				console.log(result);
			} else {
				// Error
				console.error(result);
				alert('Error! check console log for more info!');
			}
			res(result);
		});
	});
	return wait;
}
function remove_from_list(id){
	$("#tr"+(id+1)).remove();
}
function set_edit_modal(data){
	$('#edit-id').val(data.id);
	$('#edit-title').val(data.title);
	$('#edit-slug').val(data.slug);
	$('#edit-content').text(data.content);
	$('#edit-createdDate').val(data.createdDate);
	$('#edit-page').modal('show');
}
// function set_edit_game_modal(data){
// 	$("#edit-category option").prop("selected", false);
// 	//
// 	$('#edit-id').val(data.id);
// 	$('#edit-title').val(data.title);
// 	$('#edit-slug').val(data.slug);
// 	$('#edit-description').text(data.description);
// 	$('#edit-instructions').text(data.instructions);
// 	$('#edit-url').val(data.url);
// 	$('#edit-thumb_1').val(data.thumb_1);
// 	$('#edit-thumb_2').val(data.thumb_2);
// 	$('#edit-width').val(data.width);
// 	$('#edit-height').val(data.height);
// 	//$('#edit-category').val(data.category);
// 	$('#edit-tags').val(data.tags);
// 	$.each(data.category.split(","), function(i,e){
// 		$("#edit-category option[value='" + e + "']").prop("selected", true);
// 	});
// 	if(Number(data.published)){
// 		$('#edit-published').prop("checked", true);
// 	}
// 	$('#edit-game').modal('show');
// }
// function set_edit_category_modal(data){
// 	$('#edit-id').val(data.id);
// 	$('#cat-id').val(data.id);
// 	$('#edit-name').val(data.name);
// 	$('#edit-slug').val(data.slug);
// 	$('#edit-description').val(data.description);
// 	$('#edit-meta_description').val(data.meta_description);
// 	$('#edit-priority').val(data.priority);
// 	if (data.priority >= 0) {
//         $('#edit-hide').prop("checked", false);
//     } else {
//         $('#edit-hide').prop("checked", true);
//     }
// 	$('#edit-category').modal('show');
// }
function set_edit_collection_modal(data){
	$('#edit-id').val(data.collection.id);
	$('#edit-name').val(data.collection.name);
	$('#edit-slug').val(data.collection.slug);
	$('#edit-data').val(data.collection.data);
	$('#edit-description').val(data.collection.description);
	if(data.collection.allow_dedicated_page){
		$('#edit-allow_dedicated_page').prop("checked", true);
	}
	let html = '';
	if(data.list){
		data.list.forEach((item)=>{
			html += '<option>ID: '+item.id+' - '+item.title+'</option>';
		});
	}
	$('#collection-game-list').html(html);
	$('#edit-collection').modal('show');
}
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
var fetched_games_id;
var stop_add_games = false;
(function(){
	$("#add-all").on('click', function(){
		stop_add_games = false;
		fetched_games_id = [];
		let f = $("#gameList > tr");
		if(f.length){
			$('.div-stop').css('display', 'block');
			$('.div-stop').removeClass('disabled-list');
			f.each(function( index ) {
				let id = Number($( this ).attr('id').substring(2));
				fetched_games_id.push(id-1);
			});
			continous_insert_game();
		}
	});
	function continous_insert_game(){
		if(fetched_games_id.length && !stop_add_games){
			let id = fetched_games_id[fetched_games_id.length-1];
			addData(id).then((res)=>{
				if(res){
					let status = res.slice(0, 5);
					if(status === 'added' || status === 'exist'){
						fetched_games_id.pop();
						continous_insert_game();
					} else {
						console.log(res);
					}
				}	
			});
		} else {
			$('.div-stop').css('display', 'none');
		}
	}
	$("#stop-add").on('click', function(){
		$('.div-stop').addClass('disabled-list');
		stop_add_games = true;
	});
	$('select#distributor-options').change(function(){
		$('.fetch-games').removeClass('active show');
		$($(this).val()).addClass('active show');
	});
	$( "form" ).submit(function( event ) {
		let arr = $( this ).serializeArray();
		let source = $(this).attr('class');
		if(source === 'gamemonetize' || source === 'gamedistribution' || source === 'gamepix' || source === 'playsaurus' || source === 'gimcraft'){
			event.preventDefault();
			let code = $("#p_code").val();
			distributor = $(this).attr('class');
			if(distributor){
				let url = 'https://api.cloudarcade.net/v2/fetch-games.php?action=fetch&source='+distributor+'&data='+simple_array(arr)+'&code='+code;
				getGame.getList(url).then((res)=>{
					if(res['status']){
						if(res['status'] == 'error' || res['status'] == 'failed'){
							show_action_info('error - '+res['message']);
						} else {
							console.log(res);
							alert('Failed! check console log for more info');
						}
					} else {
						getGame.generateList(res);
					}
				});
			}	
		} else if($(this).attr('id') === 'form-newpage'){
			event.preventDefault();
			let data = {
				action: 'newPage',
				title: get_value(arr, 'title'),
				slug: (get_value(arr, 'slug').toLowerCase()).replace(/\s+/g, "-"),
				createdDate: get_value(arr, 'createdDate'),
				content: get_value(arr, 'content'),
			}
			sendRequest(data, true);
		} else if($(this).attr('id') === 'form-editpage'){
			event.preventDefault();
			let data = {
				action: 'editPage',
				title: get_value(arr, 'title'),
				slug: (get_value(arr, 'slug').toLowerCase()).replace(/\s+/g, "-"),
				id: get_value(arr, 'id'),
				createdDate: get_value(arr, 'createdDate'),
				content: get_value(arr, 'content'),
			}
			sendRequest(data, true);
		} else if($(this).attr('id') === 'form-editgame'){
			event.preventDefault();
			let data = {
				action: 'editGame',
				title: get_value(arr, 'title'),
				slug: (get_value(arr, 'slug').toLowerCase()).replace(/\s+/g, "-"),
				id: get_value(arr, 'id'),
				description: get_value(arr, 'description'),
				instructions: get_value(arr, 'instructions'),
				url: get_value(arr, 'url'),
				thumb_1: get_value(arr, 'thumb_1'),
				thumb_2: get_value(arr, 'thumb_2'),
				width: get_value(arr, 'width'),
				height: get_value(arr, 'height'),
				tags: get_value(arr, 'tags'),
				published: 0
			}
			data.category = get_comma(get_category_list(arr));
			if($('#edit-published').prop('checked')){
				data.published = 1;
			}
			sendRequest(data, true);
		} else if($(this).attr('id') === 'form-json') {
		   event.preventDefault();
		   let json = $('textarea[name="json-importer"]').val();
		   if(!json) {
		       alert('Data is empty!');
		       return;
		   }

		   try {
		       json = JSON.parse(json);
		       if(!isJsonStructureValid(json)) {
		           alert('JSON structure not valid!\nCheck this for more info https://cloudarcade.net/tutorial/json-importer-guide/');
		           return;
		       }

		       // Create alert div
		       const alertDiv = $('<div>')
		           .addClass('alert alert-success alert-dismissible fade show')
		           .attr('role', 'alert')
		           .html(`
		               ${json.length} games added successfully
		               <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
		           `)
		           .prependTo('.content');

		       // Process games
		       for(let i = 0; i < json.length; i++) {
		           if(json[i].hasOwnProperty('slug') && json[i].slug === '') {
		               delete json[i]['slug'];
		           }
		           json[i].action = 'addGame';
		           //json[i].tags = '';
		           sendRequest(json[i]);
		       }

		   } catch(err) {
		       alert('Error! JSON data not valid');
		   }
		} else if($(this).attr('id') === 'form-update'){
			event.preventDefault();
			let data = {
				action: get_value(arr, 'action'),
				code: get_value(arr, 'code'),
			}
			$('.progress').removeClass('d-none');
			$('#btn-update').attr('value', 'Updating');
			$('#btn-update').prop('disabled', true);
			sendRequest(data, false).then((res)=>{
				let _res = res;
				try {
					res = JSON.parse(res);
				} catch {
					res = false;
				}
				if(res){
					if(res.status === 'updated'){
						setTimeout(()=>{
							window.location = window.location.href+'&status='+res.status+'&info='+res.info;
						}, 4000);
					} else {
						$('#u-error').text('Update error!');
						$('#u-response').text(res.info);
						//If error
						$('.progress').addClass('d-none');
						$('#btn-update').addClass('d-none');
						$('#btn-update').addClass('d-none');
						$('#update-error').removeClass('d-none');
					}
				} else {
					$('#u-error').text('An unexpected error or warning has been found!');
					$('#u-response').text(_res);
					//If error
					$('.progress').addClass('d-none');
					$('#btn-update').addClass('d-none');
					$('#btn-update').addClass('d-none');
					$('#update-error').removeClass('d-none');
				}
			});
		}
	});
	$('#json-preview').click(function() {
		let json = $('textarea[name="json-importer"]').val();
		if(json){
			try {
				json = JSON.parse(json);
				if(isJsonStructureValid(json)){
					let content = '';
					for(let i=0; i<json.length; i++){
						content += '<tr>';
						content += '<td>'+(i+1)+'</td>';
						content += '<td>'+json[i].title+'</td>';
						content += '<td>'+json[i].slug+'</td>';
						content += '<td><a href="'+json[i].url+'" target="_blank">'+json[i].url+'</a></td>';
						content += '<td>'+json[i].width+'</td>';
						content += '<td>'+json[i].height+'</td>';
						content += '<td><img src="'+json[i].thumb_1+'" width="80" height="80"></td>';
						content += '<td><img src="'+json[i].thumb_2+'" width="80" height="80"></td>';
						content += '<td>'+json[i].category+'</td>';
						content += '<td>'+json[i].source+'</td>';
						content += '</tr>';
					}
					$('#table-json-preview').css('display', 'block');
					$('#json-list-preview').replaceWith(content);
				} else {
					alert('JSON structure not valid!\nCheck this for more info https://docs.cloudarcade.net/#section-87');
				}
			} catch(err) {
				alert('Error! JSON data not valid');
			}
		} else {
			alert('Data is empty!')
		}
	});
	$('.remove-category').click(function() {
		if(confirm('Are you sure?\nDeleting category also delete all games on it (if there are).')){
			window.open('request.php?action=deleteCategory&id='+$(this).attr('id')+'&redirect=dashboard.php?viewpage=categories', '_self');
		}
	});
	$('.remove-collection').click(function() {
		if(confirm('Are you sure?')){
			window.open('request.php?action=deleteCollection&id='+$(this).attr('id')+'&redirect=dashboard.php?viewpage=collections', '_self');
		}
	});
	$('.activate-plugin').click(function() {
		window.open('request.php?action=pluginAction&name='+$(this).attr('id')+'&plugin_action=activate&redirect=dashboard.php?viewpage=plugin', '_self');
	});
	$('.deactivate-plugin').click(function() {
		window.open('request.php?action=pluginAction&name='+$(this).attr('id')+'&plugin_action=deactivate&redirect=dashboard.php?viewpage=plugin', '_self');
	});
	$('.remove-plugin').click(function() {
		if(confirm('Are you sure to remove this plugin?')){
			window.open('request.php?action=pluginAction&name='+$(this).attr('id')+'&plugin_action=remove&redirect=dashboard.php?viewpage=plugin', '_self');
		}
	});
	$('a.update-plugin').click(function(e) {
		e.preventDefault();
		
		let path = $(this).data('path');
		let id = $(this).data('id');
		$(this).hide();
		$.ajax({
			url: 'includes/ajax-actions.php',
			type: 'POST',
			dataType: 'json',
			data: {action: 'update_plugin', path: path, id: id},
			complete: function (data) {
				if(data.responseText == 'ok'){
					location.reload();
				} else {
					alert('Error! Check console log');
					console.log(data.responseText);
				}
			}
		});
	});
	$( "#newpagetitle" ).click(function() {
		let parent = $( "#newpagetitle" );
		parent.change(function(){
			$( "#newpageslug" ).val((parent.val().toLowerCase()).replace(/\s+/g, "-"));
		});
	});
	$( ".deletepage" ).click(function() {
		let id = $(this).attr('id');
		if(confirm('Are you sure want to delete this page ?')){
			let data = {
				action: 'deletePage',
				id: id,
			}
			sendRequest(data, true);
		}
	});
	$( "a.deletegame" ).click(function(e) {
		e.preventDefault();
		let id = $(this).attr('data-id');
		if(confirm('Are you sure want to delete this game ?')){
			let data = {
				action: 'deleteGame',
				id: id,
			}
			sendRequest(data).then((res)=>{
				if(res == 'ok'){
					$('#game-'+id).remove();
				} else {
					console.log(res);
				}
			});
		}
	});
	// $( ".editpage" ).click(function() {
	// 	let id = $(this).attr('id');
	// 	let data = {
	// 		action: 'getPageData',
	// 		id: id,
	// 	}
	// 	sendRequest(data, false, 'edit-page');
	// });
	$( ".editcollection" ).click(function() {
		let id = $(this).attr('id');
		let data = {
			action: 'getCollectionData',
			id: id,
		}
		sendRequest(data, false, 'edit-collection');
	});
	$( "button.btn-theme" ).click(function() {
		let id = $(this).attr('id');
		window.open('request.php?action=updateTheme&theme='+$(this).attr('id')+'&redirect=dashboard.php?viewpage=themes', '_self');
		//sendRequest(data, false, 'edit-collection');
	});
	$(".custom-file-input").on("change", function() {
	  var fileName = $(this).val().split("\\").pop();
	  $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
	});
	$('#stats-option').change(function(){
		let val = $(this).val();
		let params;
		if(val === 'week'){
			params = {"limit":"-1","offset":"0","sub":"-7"};
		} else if(val === 'month'){
			params = {"limit":"-1","offset":"0","sub":"-30"};
		}
		get_data('../includes/statistics.php', params).then((res)=>{
			update_stats(convert_stats_data(res));
		});
	});
	$("#game-title-upload").on("change", function() {
		let slug = $("#game-slug-upload");
		if(slug.length){
			slug.val(($("#game-title-upload").val().toLowerCase()).replace(/\s+/g, "-"));
		}
	});
	$("#game-title-remote").on("change", function() {
		let slug = $("#game-slug-remote");
		if(slug.length){
			slug.val(($("#game-title-remote").val().toLowerCase()).replace(/\s+/g, "-"));
		}
	});
	$('.btn-tag').on('click', function() {
		let target = $(this).attr('data-target');
		let elem = $('#'+target);
		let str = elem.val();
		let comma = '';
		if(str.length && str[str.length-1] != ','){
			comma = ',';
		}
		elem.val(str +comma+$(this).attr('data-value'));
	});
	function simple_array(arr){
		let tmp = [];
		arr.forEach((item)=>{
			tmp.push(item.value);
		});
		return JSON.stringify(tmp);
	}
	function get_value(arr, key){
		for(let i=0; i<arr.length; i++){
			if(arr[i].name === key){
				return arr[i].value;
			}
		}
	}
	function get_category_list(arr){
		let cats = [];
		for(let i=0; i<arr.length; i++){
			if(arr[i].name === 'category'){
				cats.push({name: arr[i].value});
			}
		}
		return cats;
	}
	function get_official_info(only_check = false){
		let v = $("#cms-version").text();
		$.ajax({
			url: 'https://api.cloudarcade.net/get_info.php',
			type: 'POST',
			dataType: 'json',
			data: {version: v},
			success: function (data) {
				//console.log(data.responseText);
			},
			error: function (data) {
				//console.log(data.responseText);
			},
			complete: function (data) {
				let res = JSON.parse(data.responseText);
				if(!only_check){
					$('.official-info').append(res['info']);
				}
				if(res['update']){
					$.ajax({
						url: 'includes/ajax-actions.php',
						type: 'POST',
						dataType: 'json',
						data: {action: 'update_alert', type: 'update'},
					});
					if(!only_check){
						$('.update-info').append('<div class="alert alert-info alert-dismissible fade show" role="alert">New update is available! CloudArcade v'+res['update']+' , open "Updater" for more info!<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>');
					}
				} else {
					let update_alert = $('.-u-update');
					if(update_alert){
						update_alert.remove();
					}
					$.ajax({
						url: 'includes/ajax-actions.php',
						type: 'POST',
						dataType: 'json',
						data: {action: 'unset_update_alert', type: 'update'},
					});
				}
			}
		});
		check_theme_update();
		check_plugin_update();
	}
	if($('.official-info').length){
		get_official_info();
	} else {
		if($('#page-slug-dashboard').length){
			// If the CMS info is removed, the update check wont work
			// With this element, it will check update if dashboard page visited
			check_theme_update();
			check_plugin_update();
		}
	}
	if($('.check-update').length){
		get_official_info(true);
	}
	let quote = $('#quote');
	if(quote.length){
		$.ajax({
			url: 'includes/ajax-actions.php',
			type: 'POST',
			dataType: 'json',
			data: {action: 'get_quote'},
			complete: function (data) {
				let q = JSON.parse(data.responseText);
				quote.html(
				"<blockquote class='quote-text'>\""+ q.text +"\"</blockquote>" +
					"<small class='author'> - "+ q.author +"</small>"
				);
			}
		});
	}
	//
	$('#sortBy').change(function() {
		var sortByValue = $(this).val();
		$.ajax({
			url: 'includes/ajax-actions.php',
			type: 'POST',
			dataType: 'json',
			data: { action: 'fetch_games_by_type', sort: sortByValue },
			success: function(data) {
				// Clear existing table rows
				$('#dashboard-top-games tbody').empty();
				let game_url = $('#dashboard-top-games').attr('data-game-url');
				// Populate the table with the new game list
				$.each(data.results, function(index, game) {
					var votePercentage = (game.upvote + game.downvote > 0)
						? Math.floor((game.upvote / (game.upvote + game.downvote)) * 100)
						: '-';
					var row = `
						<tr>
							<td>${index + 1}</td>
							<td class="td-ellipsis">
								<a href="${game_url.replace('eeeee', game.slug)}" target="_blank">${game.title}</a>
							</td>
							<td>${game.views}</td>
							<td class="td-ellipsis">
								<span class="categories">${game.category}</span>
							</td>
							<td>
								<div class="row">
									<div class="col-4">${(votePercentage != '-' ? votePercentage + '%' : '-')}</div>
									<div class="col-4"><i class="fa fa-thumbs-up" aria-hidden="true"></i>${game.upvote}</div>
									<div class="col-4"><i class="fa fa-thumbs-down" aria-hidden="true"></i>${game.downvote}</div>
								</div>
							</td>
						</tr>`;
					$('#dashboard-top-games tbody').append(row);
				});
			},
			error: function(xhr, status, error) {
				console.log(xhr.responseText)
				console.error('AJAX Error: ' + status + error);
			}
		});
	});
	//
	document.getElementById('close-sidebar').addEventListener('click', function(e) {
		e.preventDefault();
		closeSidebar();
	});
})();
function check_theme_update(){
	$.ajax({
		url: 'includes/ajax-actions.php',
		type: 'POST',
		dataType: 'json',
		data: {action: 'check_theme_updates'},
		complete: function (data) {
			if(data.responseText != 'ok'){
				console.log(data.responseText);
			}
		}
	});
}
function show_action_info(str){
	let type = str.substring(0, 5);
	if(type === 'added' || type === 'exist' || type === 'error'){
		let msg = str.substring(8);
		let alert_type = 'success';
		if(type === 'exist'){
			alert_type = 'warning';
			msg = 'Game already exist! '+msg;
		} else if(type === 'added') {
			msg = 'Game added! '+msg;
		} else if(type === 'error') {
			alert_type = 'danger';
			msg = 'Error! '+msg;
		}
		$('#action-info').html('<div class="alert alert-'+alert_type+' alert-dismissible fade show" role="alert">'+msg+'<button type="button" class="btn-close text-white" data-bs-dismiss="alert" aria-label="Close"></button></div>');
	}
}
function get_comma(arr){
	let res = '';
	arr.forEach((item, index)=>{
		res += item['name'];
		if(index < arr.length-1){
			res += ',';
		}
	});
	return res;
}
function openSidebar() {
	let sidebar = document.getElementById("sidebar");
	let navbar = document.getElementById("mainNav");
	if(sidebar.offsetWidth === 260){ //Close
		closeSidebar();
	} else {
		sidebar.style.width = "260px";
		//navbar.style.marginLeft = "260px";
		//document.getElementById("content").style.marginLeft = "260px";
	}
}
function closeSidebar() {
	document.getElementById("sidebar").style.width = "0";
	document.getElementById("content").style.marginLeft= "0";
	document.getElementById("mainNav").style.marginLeft= "0";
	//document.getElementById("content-bar").style.marginLeft= "0";
}
function setAdminTheme(theme) {
	// Prepare the AJAX request
	// Save the value to $_SESSION for better admin theme init
	var xhr = new XMLHttpRequest();
	xhr.open('POST', '/admin/includes/ajax-actions.php', true);
	xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	// Data to send
	var data = 'action=change_admin_theme&admin_theme=' + encodeURIComponent(theme);

	// Send the request
	xhr.send(data);

	// Optional: handle response or error
	xhr.onload = function() {
		if (xhr.status === 200) {
			console.log('Admin theme switched successfully');
		} else {
			console.error('Failed to switch admin theme');
		}
	};
}
function setTheme(themeName) {
	localStorage.setItem('cloudarcade_admin-theme', themeName);
	document.documentElement.className = themeName;
	if(themeName === 'theme-light'){
		if(Stats){
			Chart.defaults.global.defaultFontColor = '#666';
			Stats.update();
		}
	} else {
		if(Stats){
			Chart.defaults.global.defaultFontColor = '#adbcce';
			Stats.update();
		}
	}
}
// function to toggle between light and dark theme
function toggleTheme() {
	if (localStorage.getItem('cloudarcade_admin-theme') === 'theme-dark') {
		setTheme('theme-light');
		setAdminTheme('theme-light');
	} else {
		setTheme('theme-dark');
		setAdminTheme('theme-dark');
	}
}

window.onload = function() {
	(function () {
		if (localStorage.getItem('cloudarcade_admin-theme') === 'theme-dark') {
			setTheme('theme-dark');
			document.getElementById('darkSwitch').checked = true;
		} else {
			setTheme('theme-light');
		}
	})();
};

function isJsonStructureValid(json){
	if(json.length){
		let total = json.length;
		for(let i=0; i<total; i++){
			let item = json[i];
			if(item.title && item.description && item.instructions && item.url && item.width && item.height && item.thumb_1 && item.thumb_2 && item.category && item.source){
				//
			} else {
				return false;
			}
			if(i > 3){
				return true;
			}
		}
	} else {
		return false;
	}
	return true;
}

var dropdown = document.getElementsByClassName("dropdown-btn");
var dropdown_content = document.getElementsByClassName("dropdown-container")[0];
var i;

for (i = 0; i < dropdown.length; i++) {
  dropdown[i].addEventListener("click", function() {
  this.classList.toggle("active");
  var dropdownContent = dropdown_content;
  if (dropdownContent.style.display === "block") {
  dropdownContent.style.display = "none";
  } else {
  dropdownContent.style.display = "block";
  }
  });
}

function check_plugin_update(){
	// This function called every dashboard visit
	$.ajax({
		url: 'includes/ajax-actions.php',
		type: 'POST',
		dataType: 'json',
		data: {action: 'get_plugin_updates_data'},
		complete: function (data) {
			if(data.responseText){
				let res = JSON.parse(data.responseText);
				let plugin_list = JSON.parse(res.plugins);
				//console.log(res);
				if(plugin_list){
					$.ajax({
						url: 'https://api.cloudarcade.net/plugin-repo/check_plugin_updates.php',
						type: 'POST',
						dataType: 'json',
						data: res,
						complete: function (data) {
							let res = JSON.parse(data.responseText);
							//console.log(res);
							if(res.status && res.status === 'success'){
								// If empty, the CMS will remove the notification
								$.ajax({
									url: 'includes/ajax-actions.php',
									type: 'POST',
									dataType: 'json',
									data: {action: 'set_plugin_updates_notification', plugin_update_list: JSON.stringify(res.updates)},
									complete: function (data) {
										//console.log(data.responseText);
									}
								});
							} else {
								//alert('Error! Check console log! Plugin update check failed!');
								console.log(data.responseText);
							}
						}
					});
				}
			}
		}
	});
}