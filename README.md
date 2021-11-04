# SuperTux Launcher

The easiest way to enjoy the SuperTux versions you love! Made with ElectronJS.

SuperTux Launcher is a SuperTux fan-made application, which allows players to install, launch and manage many different SuperTux versions on one (currently only 
Windows) device.

![Image of the launcher](https://user-images.githubusercontent.com/78196474/140398641-949c778b-3878-46d9-bc41-4a121cadfe73.png)

It aims to allow playing older, as well as newer releases of the game simultaneously on one device and remove the need for reinstalling the game, when wanting to play another version.

If you want to use SuperTux Launcher and/or help testing it, feel free to do so by downloading the latest experimental release from the "Releases" tab!

## Installing

You can run the program from source, or go to the "Releases" tab and download it directly (currently only for Windows) from there. Keep in mind this program 
**doesn't come with any warranty**, so **download it at your own risk!**

You may also want to run the program directly from source. Follow the instructions below if you need help doing so with `npm`.

<details>

<summary><b>Run directly from source</b></summary>

1. Download or clone the repository localy.

2. Install Node.js if you don't have it already installed on your machine.

3. Open a command prompt in the downloaded source's folder and type `npm install`.

4. After the required modules are installed, start the program with `npm start`.

</details>

## Credits

* [Electron](https://github.com/electron/electron) - the main module that the launcher is mostly built on.

* [Bootstrap](https://github.com/twbs/bootstrap) - used to help with modern CSS and JS front-end appearance in various ways.

* [wget-improved](https://github.com/bearjaws/node-wget) - used for GitHub download requests, because they use redirects.

* [is-online](https://github.com/sindresorhus/is-online) - helps check if the machine is actually online, not if it has any active connections, 
despite them not actually connecting you to the internet.

## Contribution

Any contributions to the launcher are very appreciated and welcome, so if you can make something better and want to do so, feel free to contribute!
