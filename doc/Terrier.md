## Classes

<dl>
<dt><a href="#TerrierLayer">TerrierLayer</a></dt>
<dd><p>The Terrier Layer represents a single data layer, like temperature or
wind.  Don't create one of these directly, have the TerrierOverlay do it
for you with the startLayer() call.  But once you have a TerrierLayer,
you can modify it with this object.</p></dd>
<dt><a href="#TerrierOverlay">TerrierOverlay</a></dt>
<dd><p>Terrier manages its layers through this singleton class.
You won't create one of these, but will be given one in the
callback for setup from the TerrierModule.</p>
<p>Think of it as the Terrier Overlay on top of your map, whether
that's MapLibre or Leaflet or some other.</p>
<p>You can keep the TerrierOverlay around to add and remove layers
as needed.</p></dd>
<dt><a href="#TerrierModule">TerrierModule</a></dt>
<dd><p>This is the module logic for Terrier and it's where you'll go to
start the toolkit running.  If you're overlaying on Leaflet, us the
startLeaflet() method to kick off display.  For MapLibre, use
startMapLibre().</p>
<p>You won't create one of these, we do that when the JS file is loaded.
Then you access the TerrierModule through the 'Terrier' global variable.
You use the start methods as defined above and call stop() when you
want Terrier to destroy all of its rendering infrastructure.</p></dd>
</dl>

<a name="TerrierLayer"></a>

## TerrierLayer
<p>The Terrier Layer represents a single data layer, like temperature or
wind.  Don't create one of these directly, have the TerrierOverlay do it
for you with the startLayer() call.  But once you have a TerrierLayer,
you can modify it with this object.</p>

**Kind**: global class  

* [TerrierLayer](#TerrierLayer)
    * [.updateParams(params)](#TerrierLayer+updateParams)
    * [.setLevel(newLevel)](#TerrierLayer+setLevel)
    * [.setInterpMode(type)](#TerrierLayer+setInterpMode)
    * [.setImportanceScale(importScale)](#TerrierLayer+setImportanceScale)
    * [.setOpacity(opacity)](#TerrierLayer+setOpacity)
    * [.getColorMap()](#TerrierLayer+getColorMap) ⇒
    * [.setColorMap(colorMap)](#TerrierLayer+setColorMap)
    * [.queryValue(x, y)](#TerrierLayer+queryValue) ⇒

<a name="TerrierLayer+updateParams"></a>

### terrierLayer.updateParams(params)
<p>If you'd like to change parameters with a dictionary, this is
the way to do it.  You can also make direct calls to setInterpMode()
and other methods directly.</p>
<p>For a discussion of what the params dictionary contains, look at the
startLayer() method in the TerrierOverlay.</p>

**Kind**: instance method of [<code>TerrierLayer</code>](#TerrierLayer)  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Dictionary</code> | <p>A dictionary of parameters values including 'interpMode', 'opacity' and 'importFactor'.</p> |

<a name="TerrierLayer+setLevel"></a>

### terrierLayer.setLevel(newLevel)
<p>Some layers have levels. This might be 'sfc' or '5m' or
'100m' or something of that sort.  If the layer does have
a level, you can set or change it with this.</p>

**Kind**: instance method of [<code>TerrierLayer</code>](#TerrierLayer)  

| Param | Type | Description |
| --- | --- | --- |
| newLevel | <code>string</code> | <p>The level to select for this layer.<br> The data for that level needs to be available from the source.</p> |

<a name="TerrierLayer+setInterpMode"></a>

### terrierLayer.setInterpMode(type)
<p>Set the interpolation type for data values.  This is how the
data is interpolated between cells as it's being rendered into
screen space.  This is separate from applying the color map.
Set it to nearest if you'd like to see each cell or you have
a data type that can't be interpolated (e.g. precip type).
Set it to linear to see bilinear interpolation.
Set to cubic for bicubic interpolation.</p>

**Kind**: instance method of [<code>TerrierLayer</code>](#TerrierLayer)  

| Param | Type | Description |
| --- | --- | --- |
| type | <code>string</code> | <p>Set the interpolation mode to be used for the layer. This can be 'nearest' to see the data cells themselves. It can be 'linear' for bilinear interpolation, which is the default. It can also be 'cubic' for bicubic interpolation, which is costly, but looks very good for data with blobby structures, like radar.</p> |

<a name="TerrierLayer+setImportanceScale"></a>

### terrierLayer.setImportanceScale(importScale)
<p>Terrier is fairly parsimonious with its memory and network bandwidth.  By
default it will load a very low resolution of your data.  This is how to
make it load more based on the screen resolution.</p>
<p>Internally there is a number called 'importance' that is used to decide when
a given data tile will be loaded.  We can tweak that number to make things
more important.  Without getting into what it actually means, we use a default
of 8.  If you want to force near pixel accuracy try 16 or 32.</p>

**Kind**: instance method of [<code>TerrierLayer</code>](#TerrierLayer)  

| Param | Type | Description |
| --- | --- | --- |
| importScale | <code>float</code> | <p>The importance scale, or importFactor (sometimes) to adjust the loading logic.</p> |

<a name="TerrierLayer+setOpacity"></a>

### terrierLayer.setOpacity(opacity)
<p>Much of the time you're overlaying your data layer on top of a map.  As
such you don't want it to be completely opaque and hide the map.  You can
control that value here.</p>
<p>0 is completely transparent and 1 is completely opaque.</p>

**Kind**: instance method of [<code>TerrierLayer</code>](#TerrierLayer)  

| Param | Type |
| --- | --- |
| opacity | <code>float</code> | 

<a name="TerrierLayer+getColorMap"></a>

### terrierLayer.getColorMap() ⇒
<p>Terrier controls its color maps a TrrShaderColorMap object.  You
typically pass in a couple of arrays to do this, one for color
and one for value, but those are turned into a TrrShaderColorMap which
can be queried.</p>

**Kind**: instance method of [<code>TerrierLayer</code>](#TerrierLayer)  
**Returns**: <p>TrrShaderColorMap The color map currently being used by
this layer.</p>  
<a name="TerrierLayer+setColorMap"></a>

### terrierLayer.setColorMap(colorMap)
<p>If you'd like to set the color map directly, which you're allowed to
do at run time, you can do so here.  The method is expecting a TrrShaderColorMap
object which you'll need to set up yourself.</p>

**Kind**: instance method of [<code>TerrierLayer</code>](#TerrierLayer)  

| Param | Type | Description |
| --- | --- | --- |
| colorMap | <code>TrrShaderColorMap</code> | <p>The color map to set for this layer.</p> |

<a name="TerrierLayer+queryValue"></a>

### terrierLayer.queryValue(x, y) ⇒
<p>Query the data value at a given point.</p>
<p>Terrier renders data and turns it into colors (or other displays) at the last
stage.  That makes it possible to query the data values at given point and this
is how you do that.</p>
<p>Query the data value at a particular screen location.  Coordinates are at full
resolution within the OpenGL context.</p>

**Kind**: instance method of [<code>TerrierLayer</code>](#TerrierLayer)  
**Returns**: <p>An array with one or two values, depending on what you queried.  Wind returns two.</p>  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>float</code> | <p>Horizontal pixel within the OpenGL screen.</p> |
| y | <code>float</code> | <p>Vertical pixel within the OpenGL screen</p> |

<a name="TerrierOverlay"></a>

## TerrierOverlay
<p>Terrier manages its layers through this singleton class.
You won't create one of these, but will be given one in the
callback for setup from the TerrierModule.</p>
<p>Think of it as the Terrier Overlay on top of your map, whether
that's MapLibre or Leaflet or some other.</p>
<p>You can keep the TerrierOverlay around to add and remove layers
as needed.</p>

**Kind**: global class  

* [TerrierOverlay](#TerrierOverlay)
    * [.startLayer(layerName, params)](#TerrierOverlay+startLayer) ⇒ [<code>TerrierLayer</code>](#TerrierLayer)
    * [.stopLayer(layer)](#TerrierOverlay+stopLayer)
    * [.getLayers()](#TerrierOverlay+getLayers) ⇒
    * [.addGeoJSON(geojson)](#TerrierOverlay+addGeoJSON)
    * [.getCurrentTime()](#TerrierOverlay+getCurrentTime) ⇒ <code>float</code>
    * [.setCurrentTime(epoch)](#TerrierOverlay+setCurrentTime)
    * [.getTimeRange()](#TerrierOverlay+getTimeRange) ⇒
    * [.timePlay(params)](#TerrierOverlay+timePlay)
    * [.isTimePlaying()](#TerrierOverlay+isTimePlaying)
    * [.timePause()](#TerrierOverlay+timePause)

<a name="TerrierOverlay+startLayer"></a>

### terrierOverlay.startLayer(layerName, params) ⇒ [<code>TerrierLayer</code>](#TerrierLayer)
<p>Start displaying a layer of the given name/type.  Assuming Terrier recognizes the
name, which will be something like 'temperature', it will fetch the corresponding
data manifests and start up the rendering pipeline.</p>
<p>The layerName depends on the contents of your stack and will be something like
'temperature' or 'wind'.  A list of available layer names can be gotten from the
fetchStackContents() in the TerrierModule, but you can also hard code those
based on what you know is in your stack.</p>

**Kind**: instance method of [<code>TerrierOverlay</code>](#TerrierOverlay)  
**Returns**: [<code>TerrierLayer</code>](#TerrierLayer) - <p>The layer object you can interact with directly to make
real-time changes.</p>  

| Param | Type | Description |
| --- | --- | --- |
| layerName | <code>string</code> | <p>Name of the layer to display, such as 'temperature'.</p> |
| params | <code>Dictionary</code> | <p>Parameters that control the display and structural use of the layer.  These include everything you might need to set up the layer including things which can be modified later.</p> <p>'level' selects the level of the data layer, if it has one.  For instance you might have 'sfc', '10m', and '152m' available for 'temperature'.  It depends on your data and you can see the full list from the stack contents, or just hard code it based on what you know is there.</p> <p>'colorMap' sets the color map for the display.  This is a TrrShaderColorMap object which you'll need to create and pass in.</p> <p>'renderScale' sets the scale at which the data is rendered.  Terrier is designed to render data to the screen and then turn that data into colors.  It uses fairly complex shaders to render the data to the screen and will thus try to do less work.  The renderScale is a factor we multiply the WebGL screen size by to downsample the rendering target.  It's 0.25 by default and you can probably leave it alone.</p> <p>'cadence' is an array of 3 values defining the min and max time offsets from now to load for a layer.  The third argument is the number of time slices.  The defaults will be picked up from the stack, so you don't really need to set this, but it can be useful to cut down on loading.  For instance, if you only need the next half hour of data and you know it comes in 5 minute increments you could do: [0,30*60,6].  That will load data from 'now' to a half hour from now and restrict it to at most 6 time slices.</p> <p>'importFactor' controls how much data we load for a given area.  Since we're fetching data with a lot of time slices we don't tend to match it pixel for pixel for the screen resolution.  By default this value is 8.  If you want more resolution, set a value up to 32.  If you want less, for some reason, it can go down to 1.</p> |

<a name="TerrierOverlay+stopLayer"></a>

### terrierOverlay.stopLayer(layer)
<p>Stop displaying the given layer.  This is the TerrierLayer returned by startLayer().
This will not shut down Terrier, however.  You need to do that with the Terrier module.</p>

**Kind**: instance method of [<code>TerrierOverlay</code>](#TerrierOverlay)  

| Param | Type | Description |
| --- | --- | --- |
| layer | [<code>TerrierLayer</code>](#TerrierLayer) | <p>The layer to stop displaying.</p> |

<a name="TerrierOverlay+getLayers"></a>

### terrierOverlay.getLayers() ⇒
<p>Get the list of currently active layers.  These are all TerrierLayer objects.</p>

**Kind**: instance method of [<code>TerrierOverlay</code>](#TerrierOverlay)  
**Returns**: <p>The list of currently active layers.</p>  
<a name="TerrierOverlay+addGeoJSON"></a>

### terrierOverlay.addGeoJSON(geojson)
<p>You can add a bit of GeoJSON over top of the map.  This is largely here
for debugging as you probably have a good way to do that with the base
map toolkit.</p>

**Kind**: instance method of [<code>TerrierOverlay</code>](#TerrierOverlay)  

| Param | Type | Description |
| --- | --- | --- |
| geojson | <code>json</code> | <p>The JSON object for GeoJSON.</p> |

<a name="TerrierOverlay+getCurrentTime"></a>

### terrierOverlay.getCurrentTime() ⇒ <code>float</code>
<p>Returns the current time being displayed (in seconds from the 1970 epoch), rather
than the current wall clock time.</p>

**Kind**: instance method of [<code>TerrierOverlay</code>](#TerrierOverlay)  
<a name="TerrierOverlay+setCurrentTime"></a>

### terrierOverlay.setCurrentTime(epoch)
<p>Set the displayed time (in seconds from the 1970 epoch).  This is the time Terrier
will use for calculating the display and is separate from wall clock time.</p>

**Kind**: instance method of [<code>TerrierOverlay</code>](#TerrierOverlay)  

| Param | Type | Description |
| --- | --- | --- |
| epoch | <code>float</code> | <p>Seconds since the 1970 epoch.</p> |

<a name="TerrierOverlay+getTimeRange"></a>

### terrierOverlay.getTimeRange() ⇒
<p>Returns the minimum and maximum times available from the data currently loaded.
Times are in seconds from the 1970 epoch.</p>

**Kind**: instance method of [<code>TerrierOverlay</code>](#TerrierOverlay)  
**Returns**: <p>An array of 2 floats describing the min and max time.</p>  
<a name="TerrierOverlay+timePlay"></a>

### terrierOverlay.timePlay(params)
<p>Terrier likes to control animation itself, rather than depend on an outside
app to smoothly run through a time range with setCurrentTime().  The way
this works is you call this method and it will start animating.  Then
periodically query the current time with getCurrentTime() and update
your own controls from that.</p>

**Kind**: instance method of [<code>TerrierOverlay</code>](#TerrierOverlay)  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Dictionary</code> | <p>This dictionary contains values which control the animation.</p> <p>'period' the number of wall clock seconds to animate from the start of the time range to the end of it.</p> |

<a name="TerrierOverlay+isTimePlaying"></a>

### terrierOverlay.isTimePlaying()
<p>If Terrier is animating the data over time, this returns true.</p>

**Kind**: instance method of [<code>TerrierOverlay</code>](#TerrierOverlay)  
<a name="TerrierOverlay+timePause"></a>

### terrierOverlay.timePause()
<p>Pause the time animation if it's running.  This does nothing if Terrier is
already paused.</p>

**Kind**: instance method of [<code>TerrierOverlay</code>](#TerrierOverlay)  
<a name="TerrierModule"></a>

## TerrierModule
<p>This is the module logic for Terrier and it's where you'll go to
start the toolkit running.  If you're overlaying on Leaflet, us the
startLeaflet() method to kick off display.  For MapLibre, use
startMapLibre().</p>
<p>You won't create one of these, we do that when the JS file is loaded.
Then you access the TerrierModule through the 'Terrier' global variable.
You use the start methods as defined above and call stop() when you
want Terrier to destroy all of its rendering infrastructure.</p>

**Kind**: global class  

* [TerrierModule](#TerrierModule)
    * [.createColorMap(values, colors)](#TerrierModule+createColorMap) ⇒
    * [.fetchStackContents(fetchFunc, failFunc)](#TerrierModule+fetchStackContents)
    * [.variableLevelsForStack(dataType)](#TerrierModule+variableLevelsForStack) ⇒ <code>Array.string</code>
    * [.variablesForStack()](#TerrierModule+variablesForStack) ⇒ <code>Array.string</code>
    * [.changeStack(stackName, readyFunc, failedFunc)](#TerrierModule+changeStack)
    * [.startLeaflet(stackName, canvasLayer, readyFunc)](#TerrierModule+startLeaflet)
    * [.startMapLibre(stackName, maplibreMap, readyFunc)](#TerrierModule+startMapLibre)
    * [.stop()](#TerrierModule+stop)

<a name="TerrierModule+createColorMap"></a>

### terrierModule.createColorMap(values, colors) ⇒
<p>We use a TrrShaderColorMap object to set and query colormaps, but
you don't have to create those directly.  Instead, use this convenience
method to do it.  Pass in your array of data values and corresponding
colors.  Those need to both be the same length.</p>

**Kind**: instance method of [<code>TerrierModule</code>](#TerrierModule)  
**Returns**: <p>TrrShaderColorMap</p>  

| Param | Type | Description |
| --- | --- | --- |
| values | <code>Array.float</code> | <p>An array of data values to use in the color map. These are actual data values in the proper units.  That may be Kelvin for temperature, and so forth.  These map directly to the colors array for a given value.</p> |
| colors | <code>Array.int</code> | <p>An array of numbers corresponding to RGBA colors. We like to use hex definitions of the form 0xAARRGGBB where A is alpha, R is red, G is green and B is blue.  These are standard in CSS and you can find a good converter online to map from your favorite color system to hex values.</p> |

<a name="TerrierModule+fetchStackContents"></a>

### terrierModule.fetchStackContents(fetchFunc, failFunc)
<p>Boxer stacks know what is in them and we can ask for that information to figure
out which layers to display and what levels they may have.  We don't get that
information by default, but if you ask for it, Terrier will fetch it and
call you back with the results.</p>
<p>The return data is JSON and looks like this:</p>
<pre class="prettyprint source"><code>{&quot;&lt;src>&quot; :  
   {&quot;&lt;region>&quot;:  
    {&quot;&lt;products>&quot;: [],  
     &quot;&lt;levels>&quot;: [],  
     &quot;temporalType&quot;: &quot;observed&quot;, &quot;forecast&quot;, &quot;both&quot;,  
     &quot;dataType&quot;: &quot;wind_uv&quot;, &quot;wind_speed&quot;, &quot;wind_speed_gust&quot;, &quot;temperature&quot;,  
                 &quot;radar&quot;, &quot;precip_rate&quot;, &quot;precip_type&quot;, &quot;cloud_cover&quot;, &quot;cloud_ceiling&quot;,  
                 &quot;pressure&quot;, &quot;visibility&quot;}}}
</code></pre>
<p>Using this is by no means required.  It's useful if you have a lot of flexible
data and obviously we like it for monitoring what's going in a stack.  But
if you already know your variable names (e.g. temperature) then you can
just use those.</p>

**Kind**: instance method of [<code>TerrierModule</code>](#TerrierModule)  

| Param | Type | Description |
| --- | --- | --- |
| fetchFunc | <code>function</code> | <p>After the contents have been fetched from Boxer, Terrier will call this function back with those JSON results.</p> |
| failFunc | <code>function</code> | <p>If the contents fetch fails for some reason, this function will be called back with that information.</p> |

<a name="TerrierModule+variableLevelsForStack"></a>

### terrierModule.variableLevelsForStack(dataType) ⇒ <code>Array.string</code>
<p>Search through the stack contents and return all the various levels for a given
variable.  For example you might pass in 'temperature' and get back ['sfc','10m','152m'].
The actual list depends on your stack and data and you need to have already called
fetchStackContents() at least once.</p>

**Kind**: instance method of [<code>TerrierModule</code>](#TerrierModule)  
**Returns**: <code>Array.string</code> - <p>Levels supported for the data type</p>  

| Param | Type | Description |
| --- | --- | --- |
| dataType | <code>string</code> | <p>Data type to get the levels for.</p> |

<a name="TerrierModule+variablesForStack"></a>

### terrierModule.variablesForStack() ⇒ <code>Array.string</code>
<p>The unique variable types for a given stack.  This is essentially all
the layerNames you might pass in when starting a new layer.</p>

**Kind**: instance method of [<code>TerrierModule</code>](#TerrierModule)  
**Returns**: <code>Array.string</code> - <p>All the valid layer names for a stack.</p>  
<a name="TerrierModule+changeStack"></a>

### terrierModule.changeStack(stackName, readyFunc, failedFunc)
<p>Normally you pass in the stack name on startup and then use just that
stack.  This will let you point to another stack.  As a developer, you
probably won't use this, but we do use it in our testing.</p>

**Kind**: instance method of [<code>TerrierModule</code>](#TerrierModule)  

| Param | Type | Description |
| --- | --- | --- |
| stackName | <code>string</code> | <p>Name of the stack to use.  This is provided to you as a developer.  Your company will typically have one production and one development stack.</p> |
| readyFunc | <code>function</code> | <p>Once we've communicated with the stack, Terrier calls this function back with the TerrierOverlay object.  You can use that start and stop layers.</p> |
| failedFunc | <code>function</code> | <p>If the stack can't be reached, for whatever reason, we call this function with no arguments.</p> |

<a name="TerrierModule+startLeaflet"></a>

### terrierModule.startLeaflet(stackName, canvasLayer, readyFunc)
<p>If you're using Leaflet as your base map package, this is the method
to call to kick off Terrier.  The system does a lot on initialization,
including load its WebAssembly and start up WebGL.  Call this when
you're ready to go and have the canvas layer from Leaflet.</p>

**Kind**: instance method of [<code>TerrierModule</code>](#TerrierModule)  

| Param | Type | Description |
| --- | --- | --- |
| stackName | <code>string</code> | <p>Name of the Boxer stack you're communicating with. You'll typically have one production and one development stack as an enterprise user.</p> |
| canvasLayer | <code>Canvas</code> | <p>The Canvas layer to attach to within Leaflet. See the Leaflet example for details on this.</p> |
| readyFunc | <code>function</code> | <p>When Terrier is properly initialized it will call this function back with the TerrierOverlay you can use to start new layer displays.</p> |

<a name="TerrierModule+startMapLibre"></a>

### terrierModule.startMapLibre(stackName, maplibreMap, readyFunc)
<p>If you're using MapLibre as your base map package, this is the method
to call to kick off Terrier.  The system does a lot on initialization,
including load its WebAssembly.</p>
<p>MapLibreGL (and MapboxGL) integration is very smooth since
both the base toolkit and Terrier are using WebGL.  If you have a choice,
this is the better integration to use.</p>

**Kind**: instance method of [<code>TerrierModule</code>](#TerrierModule)  

| Param | Type | Description |
| --- | --- | --- |
| stackName | <code>string</code> | <p>Name of the Boxer stack you're communicating with. You'll typically have one production and one development stack as an enterprise user.</p> |
| maplibreMap | <code>maplibreMap</code> | <p>The main MapLibre object.  See the MapLibre example for details.</p> |
| readyFunc | <code>function</code> | <p>When Terrier is properly initialized it will call this function back with the TerrierOverlay you can use to start new layer displays.</p> |

<a name="TerrierModule+stop"></a>

### terrierModule.stop()
<p>If you want Terrier completely stopped, this is what you can call.
If you want to shutdown a layer, just call the corresponding method
on the TerrierOverlay.</p>

**Kind**: instance method of [<code>TerrierModule</code>](#TerrierModule)  
