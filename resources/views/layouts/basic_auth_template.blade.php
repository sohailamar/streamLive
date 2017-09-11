<!DOCTYPE html>
<!--[if IE 8]> <html lang="en" class="ie8 no-js"> <![endif]-->
<!--[if IE 9]> <html lang="en" class="ie9 no-js"> <![endif]-->
<!--[if !IE]><!-->
<html lang="en" >
    <!--<![endif]-->
    <!-- BEGIN HEAD -->
    <head>        
        <meta charset="utf-8"/>
        <title>Tetratech Admin Panel</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
        <meta content="" name="description"/>
        <meta content="" name="author"/>
        <!-- BEGIN GLOBAL MANDATORY STYLES -->
        <link href="http://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700&subset=all" rel="stylesheet" type="text/css"/>
        <link href="{{ asset('public/global') }}/plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" type="text/css"/>
        <link href="{{ asset('public/global') }}/plugins/simple-line-icons/simple-line-icons.min.css" rel="stylesheet" type="text/css"/>
        <link href="{{ asset('public/global') }}/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" type="text/css"/>
        <link href="{{ asset('public/global') }}/plugins/uniform/css/uniform.default.css" rel="stylesheet" type="text/css"/>
        <link href="{{ asset('public/global') }}/plugins/bootstrap-switch/css/bootstrap-switch.min.css" rel="stylesheet" type="text/css"/>
        <!-- END GLOBAL MANDATORY STYLES -->
        <!-- BEGIN PAGE LEVEL STYLES -->
        <link href="{{ asset('public/global') }}/plugins/select2/select2.css" rel="stylesheet" type="text/css"/>
        <link href="{{ asset('public/admin') }}/pages/css/login.css" rel="stylesheet" type="text/css"/>
        <!-- END PAGE LEVEL SCRIPTS -->
        <!-- BEGIN THEME STYLES -->
        <link href="{{ asset('public/global') }}/css/components.css" rel="stylesheet" type="text/css"/>
        <link href="{{ asset('public/global') }}/css/plugins.css" rel="stylesheet" type="text/css"/>
        <link href="{{ asset('public/admin') }}/layout/css/layout.css" rel="stylesheet" type="text/css"/>
        <link id="style_color" href="/assets/admin/layout/css/themes/default.css" rel="stylesheet" type="text/css"/>
        <link href="{{ asset('public/admin') }}/layout/css/custom.css" rel="stylesheet" type="text/css"/>
        <!-- END THEME STYLES -->
        <link rel="shortcut icon" href="favicon.ico"/>
    </head>
    <body class="login">
        <!-- BEGIN LOGO -->
        <div class="logo">
             <a class="gbmLogo2" href="<?php echo route("admin"); ?>">                
                Tetra Tech
            </a>
        </div>
        <!-- END LOGO -->
        <!-- BEGIN SIDEBAR TOGGLER BUTTON -->
        <div class="menu-toggler sidebar-toggler">
        </div>
        <!-- END SIDEBAR TOGGLER BUTTON -->

        @yield('content') 



        <!-- BEGIN COPYRIGHT -->
        <div class="copyright">
            <?php echo date('Y') ?> &copy; Tetra Tech. Admin Panel.
        </div>                
        <!-- END CORE PLUGINS -->
        <script src="{{ asset('public/global') }}/plugins/jquery-1.11.0.min.js" type="text/javascript"></script>
        <script src="{{ asset('public/global') }}/plugins/jquery-migrate-1.2.1.min.js" type="text/javascript"></script>
        <!-- IMPORTANT! Load jquery-ui-1.10.3.custom.min.js before bootstrap.min.js to fix bootstrap tooltip conflict with jquery ui tooltip -->
        <script src="{{ asset('public/global') }}/plugins/jquery-ui/jquery-ui-1.10.3.custom.min.js" type="text/javascript"></script>
        <script src="{{ asset('public/global') }}/plugins/bootstrap/js/bootstrap.min.js" type="text/javascript"></script>
        <script src="{{ asset('public/global') }}/plugins/select2/select2.js" type="text/javascript"></script>
        <script src="{{ asset('public/global') }}/plugins/bootstrap-hover-dropdown/bootstrap-hover-dropdown.min.js" type="text/javascript"></script>
        <script src="{{ asset('public/global') }}/plugins/jquery-slimscroll/jquery.slimscroll.min.js" type="text/javascript"></script>
        <script src="{{ asset('public/global') }}/plugins/jquery.blockui.min.js" type="text/javascript"></script>
        <script src="{{ asset('public/global') }}/plugins/jquery.cokie.min.js" type="text/javascript"></script>
        <script src="{{ asset('public/global') }}/plugins/uniform/jquery.uniform.min.js" type="text/javascript"></script>
        <script src="{{ asset('public/global') }}/plugins/bootstrap-switch/js/bootstrap-switch.min.js" type="text/javascript"></script>
        <!-- BEGIN PAGE LEVEL PLUGINS -->
        <script src="{{ asset('public/global') }}/plugins/jquery-validation/js/jquery.validate.min.js" type="text/javascript"></script>
        <script type="text/javascript" src="{{ asset('admin') }}/assets/global/plugins/select2/select2.min.js"></script>
        <!-- END PAGE LEVEL PLUGINS -->
        <!-- BEGIN PAGE LEVEL SCRIPTS -->
        <script src="{{ asset('public/global') }}/scripts/metronic.js" type="text/javascript"></script>
        <script src="{{ asset('public/admin') }}/layout/scripts/layout.js" type="text/javascript"></script>
        <script src="{{ asset('public/admin') }}/layout/scripts/quick-sidebar.js" type="text/javascript"></script>
        <script src="{{ asset('public/admin') }}/pages/scripts/login.js" type="text/javascript"></script>
        <!-- END PAGE LEVEL SCRIPTS -->
        <script>
            jQuery(document).ready(function () {                
                Metronic.init(); // init metronic core components
                Layout.init(); // init current layout
                QuickSidebar.init() // init quick sidebar
                Login.init();
            });
        </script>
        <!-- END JAVASCRIPTS -->
    </body>
    <!-- END BODY -->
</html>
