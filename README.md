# Freemius pricing page v2.0

A modern, API-driven, ReactJS-based pricing app for Freemius sellers.

**Note:** This pricing app is currently in _Beta_. Once out of _Beta_, its
compiled version will be shipped as part of the Freemius'
[WordPress SDK](https://github.com/Freemius/wordpress-sdk).

![Pricing app screenshot](screenshot-1.png?raw=true)

## Why?

### Faster Development | Modern Technology - ReactJS

Freemius current in-dashboard pricing page was initially developed back in 2015.
Obviously, the page has undergone extensive development as we’ve added many
features throughout the years. But the front-end technologies it uses are
already outdated, making the maintenance, bug fixing, and new features
development, much slower.

### Flexibility | Coverage of More Use-Cases

After seeing so many pricing structures, we have a much better understanding of
the limitations of the legacy pricing page. For example, if you have a single
paid plan with several site-level prices (e.g., single-site, 3-sites, and
5-sites prices), the current pricing page will only show a single package with
multiple price options. The new pricing page is much "smarter" and facilitates
many pricing use-cases we haven't supported before. For the particular example
mentioned above, the new pricing page will expand that single plan into multiple
packages according to the number of site-level prices you offer.

### Responsiveness | Mobile-Friendly

While most of the traffic in the WP Admin is still happening via desktop
devices, we do see a growing trend of in-dashboard purchases through mobile
devices. The current pricing page is responsive but not very mobile-friendly, as
one of the main challenges is figuring out how to present multiple packages in a
user-friendly way. After reviewing dozens of mobile-friendly pricing pages, we
believe that we cracked it!

### Freedom | Open-Source

One of the main lessons learned over the years with regards to pricing pages is
that it's impossible to cover all use-cases. While there are many benefits to
offering the pricing page as a service, we decided to open-source it and give
you complete flexibility to modify it as you wish, something that is currently
impossible since it's running remotely from our end.

## How can I use or test it in my own plugin or theme?

1. Check out the [pricing-page repo](https://github.com/Freemius/pricing-page).
2. Make sure you have the latest LTS of node (v16 at the time of writing)
   installed.
3. Switch to the `develop` branch if you want the most up-to-date version. Keep
   using the `master` branch if you want the stable version.
4. Run `npm install`.
5. Run `npm run build` (it will create a `dist` directory).
6. Replace the WordPress SDK version integrated with your plugin/theme with
   at-least the
   [2.4.3](https://github.com/Freemius/wordpress-sdk/releases/tag/2.4.3)
   version.
7. Copy the the `dist` folder into the SDK's `/includes` folder and rename it to
   `freemius-pricing`.
8. That’s it! If you navigate to the pricing page you'll see the new pricing app
   in action.

## How to create my own pricing app version?

Once the pricing app is out from _Beta_ mode, its compiled version will be
shipped by default as part of the
[WordPress SDK](https://github.com/Freemius/wordpress-sdk), and that would be
the version that is loaded by default. If you want to load a custom pricing app
version for your product, make sure to follow these steps.

A more detailed and developer oriented guide with watch tasks can be found in
our [Contributors Guide](CONTRIBUTING.md).

1. Fork the `develop` branch of the
   [pricing-page repo](https://github.com/Freemius/pricing-page).
2. Run `npm install` to download all the necessary dependencies.
3. Edit the app as you wish.
4. Once ready, run `npm run build` (it will create a `dist` directory).
5. Copy the `dist` folder into your plugin/theme's main folder and rename it to
   `freemius-pricing`.
6. Kindly follow the instruction below for your plugin or theme.

> **IMPORTANT:** Do not add it to the SDK because it will be overridden the next
> time you upgrade the SDK).

### Adding custom pricing page in your Plugin

Set the custom pricing app path using the `freemius_pricing_js_path` filter:

```php
<?php
    function my_custom_pricing_js_path( $default_pricing_js_path ) {
        return plugin_dir_path( __FILE__ ) .
            '/path/to/your/freemius-pricing.js';
    }

    my_fs()->add_filter( 'freemius_pricing_js_path', 'my_custom_pricing_js_path' );
```

Please note the filter `freemius_pricing_js_path` expects the absolute path to
the main JavaScript file.

### Adding custom pricing page in your Theme

Set the custom pricing app path using the same `freemius_pricing_js_path`
filter. But please note the difference in the code to get the active theme
directory.

```php
<?php
    function my_custom_pricing_js_path( $default_pricing_js_path ) {
        return get_stylesheet_directory() .
            '/path/to/your/freemius-pricing.js';
    }

    my_fs()->add_filter( 'freemius_pricing_js_path', 'my_custom_pricing_js_path' );
```

If for some reasons, you are using a child theme and would like to refer to the
parent theme for **the SDK and the pricing app**, please use
`get_template_directory` instead.

```php
<?php
    function my_custom_pricing_js_path( $default_pricing_js_path ) {
        return get_template_directory() .
            '/path/to/your/freemius-pricing.js';
    }

    my_fs()->add_filter( 'freemius_pricing_js_path', 'my_custom_pricing_js_path' );
```

If for some reasons, the output of the `get_stylesheet_directory` is filtered in
an unexpected way, you can use this:

```php
<?php
    function my_custom_pricing_js_path( $default_pricing_js_path ) {
        return get_theme_root( get_stylesheet() ) .
            '/path/to/your/freemius-pricing.js';
    }

    my_fs()->add_filter( 'freemius_pricing_js_path', 'my_custom_pricing_js_path' );
```

## How to setup the development environment for contributions

Please our [Contributors Guide](CONTRIBUTING.md).
