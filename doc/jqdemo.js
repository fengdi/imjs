define(["jquery","html"],function($, html){

	var codedd = html();//返回【依赖】章节例子的元素 参考html模块

	
	var top = $(window).scrollTop()+300;

	$(codedd).css({position:"absolute","z-index":9999})
		.animate({top:top,"font-size":"+40px"},900)
		.animate({left:"+290px"},1500);
});