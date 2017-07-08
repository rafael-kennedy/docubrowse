var req = require.context("./", false, /\.vue$/);
var compObj = {}
req.keys().forEach(function(key){
    compObj[key.match(/\.\/(.+)\.vue/)[1]]= req(key);
});

export default compObj
