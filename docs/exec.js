//代码可执行
define(['jquery'],function($){

	$(".exec").each(function(){
		var $code = $(this);		
		$code.wrap('<div class="codewrapper"></div>');

		var position = $code.position();


		var $button = $("<button>").on("click",function(){

			var code = $(this).prev().text();
			try{
				(new Function(code))();
			}catch(e){}

		}).text("运行").insertAfter(this);


		$button.css({
			position:"absolute",
			top:position.top+$code.outerHeight()-$button.outerHeight()+"px",
			left:position.left+$code.outerWidth()-$button.outerWidth()+"px",
			"z-index":999
		})
	});

});