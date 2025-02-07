### Terrier Version 1 to 2 Migration

Terrier versions correspond to Boxer, our back end, versions and when Boxer when to 2, Terrier went with it.

Versions 1 and 2 aren't compatible, but if you have an old Boxer1 stack, that will continue to work with Terrer1.  When we move a customer to Boxer2 it's with a new back end stack.

The main difference between Boxer 1 and 2 from Terrier's perspective is the list of available data.  In Terrier1 the list was baked in.  Now we fetch the list of what we call "visual variable keys".  

## What's In the Visual Variable Keys
These are the variables we can look at.  Any one of them should be displayable with the right settings and colormap and we provide defaults for those now as well.

It's useful to look at what's available and you can see that in the Terrier.stackContents.  That will be filled in as soon as you get your callback that Terrier is initialized.

You'll see the stack contents are organized by a hierarchy of source, region, product, and variable.  Levels and intervals are then listed within each variable.

Variables are things like "temperature" or "wind_uv" and they'll be consistent across data sets, with the same units and the ability to display them at the same time.  But you probably don't want to display most of them together.

If you look at our App.jsx in the dashboard app you'll see we iterate through a generic list of variables and then narrow down what we're displaying based on dataType.  We don't recommend that.

We use our dashboard for debugging, so it can display anything, with some guesses as to how to display it thrown in, but always a fallback to just show *something*.  You don't need to do that.  You know that you want to display and can be more direct.

## How to Display a Variable
In Terrier1 you'd just call the Layer constructor, give it a variable name and let it figure things out.  You can still sort of do that, but it's not what we recommend.  We suggest you ask for the sources yourself, first.

Terrier now has a sourcesForVariable() call that takes a set of search parameters to help filter out what you'd like to see.  The preferred workflow is to call this first for your list of sources, pick your level and colorMap and then create the Layer.

We like to throw extra regions in, overlapping data sets, all sorts of things you don't necessarily want to display.  sourcesForVariable() lets you narrow all that down.  For example, here's what you'd pass in for 2m temperature from HRRR and GFS over CONUS.

```
{source: ['gfs','hrrr'], region: ['global','conus'], variable: 'temperature', level: '2m'}
```

That'll return a list of matching sources which you can then pass to the Layer constructor.

## New Colormaps
You probably have a colormap you want to apply, but if you don't we provide some defaults.

There's now a method on Terrier called colorMapForVariable() that will look at the variable dataType, name, and a few other random bits to try and figure out the best color map to use.

You can always supply your own, of course.

## What's Next for Terrier
Stack contents were the big change for Boxer and Terrier.  That's likely to be the last breaking change we make for a while.
