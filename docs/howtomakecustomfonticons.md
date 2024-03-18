# How to make custom font icons

## Creating a new custom icon

1. Create an svg (possibly in inkscape) with width and height set to 512:
```html
<svg
   width="512"
   height="512"
   viewBox="0 0 512 512"
>
```
2. Draw the icon. The whole viewport can be used without considering margins.
3. Go to [IcoMoon](https://icomoon.io/app/#/select)
4. Import all icons from `/resources/fonticons`, and select them.
5. Import the new svg file and select it too.
6. Click _Generate Font_
7. Ensure that name and keycode matches the file names:
   * eg. `e900_downstairs.svg` should have keycode `e900` and name `downstairs`.
8. Save the new icon file under `/resources/fonticons` using the selected keycode and name.
9. Click the Cog-icon next to the _Download_ button at the bottom:
   * Change _Font Name_ to `muicon`
	* Change _Class Prefix_ to `muicon-`
10. Click _Download_ to recieve a  `muicon.zip` file
12. Unpack `style.css` and replace `fonts` to `/src/common/icons/`
12. Edit `FAIcon.js` and add the new icon to the `customIcons` object.
