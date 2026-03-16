# Handtracking for Scratch
This is my first repo, and I'm just doing it for fun
This is an extension for tracking hands for TurboWarp and TurboWarp-based clients, like PenguinMod.

It uses Google's MediaPipe hand landmark

## Credits to https://yokobond.github.io/xcx-mp-hand/ (a Xcratch extension)
Thank you for your awesome code, Gemini based on your project to create this one.

## WARNING -- THE CODE WAS FULLY DONE BY AI --
### If you don't have a problem with that, you can proceed

The repo was done by me and the guide, but the code was done by AI, so this wasn't done with OpenClaw or something similar

This is an extension compatible with both TurboWarp and PenguinMod.

# Guide for PenguinMod

To install it you will click on "extensions"

![Extensions_button](/Images/Penguinmod/Extensions%20button.png)



Then click on Load Custom Extension

![Load_custom_extension](/Images/Penguinmod/Load_custom_extension.png)



Then input the following URL "https://raw.githubusercontent.com/dogsailerofcountries/handtracking-for-scratch/refs/heads/main/Hand-tracking.js"
(It sometimes works better when you click on sandboxed, and can also fix some issues.)

![Url_image](/Images/Penguinmod/Url-extension.png)



(Optional) You can add it to your extensions list if you want.

![Add_to_list](/Images/Penguinmod/Add_to_list.png)



Now you should see the extension on the sidebar

![Extension_Icon](/Images/Penguinmod/Hand_track_Icon.png)

# Guide for TurboWarp

First go to "https://raw.githubusercontent.com/dogsailerofcountries/handtracking-for-scratch/refs/heads/main/Hand-tracking.js"

![Searchbar](/Images/Turbowarp/Search_bar.png)

Select all the text with Ctrl + A and then copy it Ctrl + C

![Copytext](/Images/Turbowarp/Copy_text.png)

Once on TurboWarp click on the "add extension" button

![Extensionaddbutton](/Images/Turbowarp/Extension_icon.png)

Search for "custom extension" and select "custom extension"

![Custom_extesnion](/Images/Turbowarp/Custom_extension.png)

Then paste the text you just copied, and you MUST check the run unsandboxed option.

![Setup](/Images/Turbowarp/Turbowarp_setup.png)

The extension should now be available through the sidebar

![Hand_track_Icon](/Images/Turbowarp/Hand_track_icon.png)


## Recommendations
+ Use this extension on an environment with light
+ It isn't failureless but should work for most cases
+ Sometimes hands can randomly disappear from the project, recommend doing whatever you do based on the hands coordinates only if it isn't equal to X, 0 and Y, 0 on that specific hand.

## Usage
I think most blocks are self explanatory but I'm going to explain 2 of them.

+ Detection interval
It defines how much time will pass before the model scans for your hand

![Detection_interval](/Images/Explanation/Detection_interval_BLock.png)

+ ... landmark .... on hand ...
With this block you can get the position of a part of a hand.

So you can get "x, y, z" of part "wrist" of hand "1-(the amount/limit of hands you set/on stage)"

![Position_block](/Images/Explanation/Position_block.png)

## Why?
I was just trying to make an extension with Gemini (which usually doesn't turn out well) but unlike most times it turned very well, so I decided to share on GitHub.





