$(document).ready(function () {
	var updateOutput = function (show_alert = true) {
		$('#nestable-output').val(JSON.stringify($('#nestable').nestable('serialize')));
		if(show_alert){
			$("#alert-menu-unsaved-changes").show();
		}
	};

	$('#nestable').nestable().on('change', updateOutput);

	updateOutput(false);

	function insert_menu_item(label, url){
		if ((!url) || (!label)) return;
		let id = Date.now();
		let item =
			'<li class="dd-item dd3-item" data-id="' + id + '" data-label="' + label + '" data-url="' + url + '">' +
			'<div class="dd-handle dd3-handle" > Drag</div>' +
			'<div class="dd3-content"><span>' + label + '</span>' +
			'<div class="item-edit"><i class="fa fa-pencil-alt" aria-hidden="true"></i></div>' +
			'</div>' +
			'<div class="item-settings d-none">' +
			'<div class="form-group">' +
			'<label>Navigation Label</label><input type="text" class="form-control" name="navigation_label" value="' + label + '">' +
			'</div>' +
			'<div class="form-group">' +
			'<label>Navigation Url</label><input type="text" class="form-control" name="navigation_url" value="' + url + '">' +
			'</div>' +
			'<p><a class="item-delete" href="javascript:;">Remove</a> | ' +
			'<a class="item-close" href="javascript:;">Close</a></p>' +
			'</div>' +
			'</li>';

		$("#nestable > .dd-list").append(item);
		$("#nestable").find('.dd-empty').remove();
		$("#add-item [name='name']").val('');
		$("#add-item [name='url']").val('');
		updateOutput();
	}

	$("#add-item").submit(function (e) {
		e.preventDefault();
		let arr = $( '#add-item' ).serializeArray();
		insert_menu_item(arr[0].value, arr[1].value);
	});

	$("#form-category-menu").submit((e)=>{
		e.preventDefault();
		let elem = $("#form-category-menu");
		let arr = elem.serializeArray();
		arr.forEach((item)=>{
			let child = elem.find('#item-'+item.value);
			item.url = child.data('url');
			child.prop('checked', false);
			insert_menu_item(item.name, item.url);
		});
	});

	$("#form-page-menu").submit((e)=>{
		e.preventDefault();
		let elem = $("#form-page-menu");
		let arr = elem.serializeArray();
		arr.forEach((item)=>{
			let child = elem.find('#item-'+item.value);
			item.url = child.data('url');
			child.prop('checked', false);
			insert_menu_item(item.name, item.url);
		});
	});

	$(document).on("click", ".item-delete", function (e) {
		$(this).parent().parent().parent().remove();
		updateOutput();
	});


	$(document).on("click", ".item-edit", function (e) {
		var item_setting = $(this).parent().next();
		if (item_setting.hasClass("d-none")) {
			item_setting.removeClass("d-none");
		} else {
			item_setting.addClass("d-none");
		}
	});

	$(document).on("click", ".item-close", function (e) {
		var item_setting = $(this).parent().parent();
		item_setting.addClass("d-none");
	});

	$(document).on("change paste keyup", "input[name='navigation_label']", function (e) {
		console.log($(this).parent().parent().parent().data("label"));
		$(this).parent().parent().parent().data("label", $(this).val());
		$(this).parent().parent().prev().find("span").text($(this).val());
	});

	$(document).on("change paste keyup", "input[name='navigation_url']", function (e) {
		$(this).parent().parent().parent().data("url", $(this).val());
	});

});