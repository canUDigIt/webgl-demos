var THREEJSAPP_RENDER,
    THREEJSAPP_TIMER_ID = -1,
    THREEJSAPP_RENDER_RATE = 500;

function ThreejsApp(options) {
    this.loadSceneHook = undefined;
    this.configureHook = undefined;
    this.drawSceneHook = undefined;
    renderer =  new THREE.WebGLRenderer( options );
}
  
ThreejsApp.prototype.run = function(){
        if (this.configureHook === undefined){
            alert('The Threejs application cannot start because the configureHook has not been specified'); return;
        }
        if (this.loadSceneHook === undefined){
            alert('The Threejs application cannot start because the loadSceneHook has not been specified'); return;
        }
        if (this.drawSceneHook === undefined){
            alert('The Threejs application cannot start because the drawSceneHook has not been specified'); return;
        }
        
        this.configureHook();
        
        this.loadSceneHook();
        
        THREEJSAPP_RENDER = this.drawSceneHook;
        
        renderLoop();
 };
 
 /**
 * Causes immediate rendering
 */
 ThreejsApp.prototype.refresh = function(){
    if (THREEJSAPP_RENDER) THREEJSAPP_RENDER();
 };
     
renderLoop = function(){
     Utils.requestAnimFrame(renderLoop);

     THREEJSAPP_RENDER();
};