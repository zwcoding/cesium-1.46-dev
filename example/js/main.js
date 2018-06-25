
var developMode=true;
if(developMode){
	require.config({
		baseUrl:'../Source'
	});
}else{

}
if(typeof Cesium !=="undefined"){
	onload(Cesium);
}else if(typeof require==="function"){
	require(["Cesium"],function(Cesium){
		onload(Cesium);
	});

}