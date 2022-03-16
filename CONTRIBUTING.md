# Setup Development Environment

In the development environment we'd like to have a way to watch the files and
create development builds on the fly. We do have a system for that. Please
follow along.

Here we will assume we are developing against a Plugin. But you can tweak the
`freemius_pricing_js_path` filter function to work along a Theme too.

#### 1: Git clone this repository on the root of your plugin

```sh
git clone git@github.com:Freemius/pricing-page.git freemius-pricing
git checkout develop
# Create a feature branch
git checkout -b feature/some-feature
```

If you do not have access to work with this repository directly, kindly fork it.

#### 2: Install dependencies

Please make sure you're on current Node LTS (v16 at the time of writing).

```sh
node --version # check output > 16
npm install
```

#### 3: Setup VSCode

We are using [VSCode](https://code.visualstudio.com/) for development and we use
[prettier](https://prettier.io) for code-formatting. Please install VSCode and
have the following workspace settings.

```json
{
  "[javascriptreact]": {
    "editor.formatOnSave": true
  },
  "[markdown]": {
    "editor.formatOnSave": true
  }
}
```

The workspace settings is not mandatory, but helps keep things clean as you save
the changes.

Please note that before every commit, the system will automatically run prettier
on changed files.

#### 4: Set your plugin to use development version of the pricing app

In your plugin code, please add the filter to tell our WordPress SDK to pick the
pricing app JS files directly from our development environment.

```php
<?php
    function my_custom_pricing_js_path( $default_pricing_js_path ) {
        return plugin_dir_path( __FILE__ ) .
            '/freemius-pricing/dist/freemius-pricing.js';
    }

    my_fs()->add_filter( 'freemius_pricing_js_path', 'my_custom_pricing_js_path' );
```

#### 5: Start the development server

Now please run the following command.

```sh
npm run start
```

This will run webpack in watch mode and will keep on emitting development builds
as you make changes.

Please navigate to the **"Upgrade"** or the **"Pricing"** page of your Plugin.
You should see the changes you've made.

#### 6: Building for production

Please run the following command.

```sh
npm run build
```

This will run webpack in production mode and will create optimized bundle.
