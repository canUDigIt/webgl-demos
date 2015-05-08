var WEBGLAPP_RENDER,
    WEBGLAPP_TIMER_ID = -1,
    WEBGLAPP_RENDER_RATE = 500;

function WebGLApp(canvas) {
    this.loadSceneHook = undefined;
    this.configureGLHook = undefined;
    this.handleContextLostHook = undefined;
    this.handleContextRestoredHook = undefined;
    this.gl = twgl.getWebGLContext(canvas);

    this.width = canvas.width;
    this.height = canvas.height;
}
  
WebGLApp.prototype.run = function(){
        if (this.configureGLHook === undefined){
            alert('The WebGL application cannot start because the configureGLHook has not been specified'); return;
        }
        if (this.loadSceneHook === undefined){
            alert('The WebGL application cannot start because the loadSceneHook has not been specified'); return;
        }
        if (this.drawSceneHook === undefined){
            alert('The WebGL application cannot start because the drawSceneHook has not been specified'); return;
        }
        if (this.handleContextLostHook === undefined) {
            alert('The WebGL application cannot start because the handleContextLostHook has not been specified'); return;
        }
        if (this.handleContextRestoredHook === undefined) {
            alert('The WebGL application cannot start because the handleContextRestoredHook has not been specified'); return;
        }
        
        this.configureGLHook();
        
        this.loadSceneHook();
        
        WEBGLAPP_RENDER = this.drawSceneHook;
        
        this.renderLoop = function() {
            requestAnimationFrame(this.renderLoop);

            this.drawSceneHook();
        };
 };
 
 /**
 * Causes immediate rendering
 */
 WebGLApp.prototype.refresh = function(){
    if (this.drawSceneHook) this.drawSceneHook();
 };

 WebGLApp.prototype.stop = function(){
    cancelAnimationFrame(this.renderLoop);
 };