<!DOCTYPE html>
<html lang="en" class="no-js">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
        <!--site meta data-->
        <title>Trendig Diveos</title>
        <meta name="description" content="@yield('description')">        
        <meta name="keywords" content="streamLive,live channels,youtube videos,youtube live,live videos" />
        <!--End site meta data-->

        <!--Facebook metadata-->
        <meta property="og:url"                content="https://trendingdiveos.com/" />
        <meta property="og:type"               content="website" />
        <meta property="og:title"              content="TrendingDiveos" />
        <meta property="og:description"        content="streamLive,live channels,youtube videos,youtube live,live videos." />
        <meta property="og:image"              content="http://trendingdiveos.com/public/images/logo.png" />
        <!--meta tags-->
        <script async src="//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
        <script>
          (adsbygoogle = window.adsbygoogle || []).push({
            google_ad_client: "ca-pub-4937126499725533",
            enable_page_level_ads: true
          });
        </script>
        @include('layouts.head')
    </head>
    <body id="main_body" class="preload">
        <div class="wrap">
            <!----start-Header---->
            @include('layouts.header')
            <!----End-Header---->
            <div class="clear"> </div>
            <div class="content">
                @yield('content')                        
            </div><!--z_Content-->
            <div class="clear"> </div>
        </div>
        @include('layouts.footer')
        @include('layouts.foot')
        <!-- END JAVASCRIPTS -->
    </body>
    <!-- END BODY -->
</html>