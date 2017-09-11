<div class="page-sidebar-wrapper">
    <!-- DOC: Set data-auto-scroll="false" to disable the sidebar from auto scrolling/focusing -->
    <!-- DOC: Change data-auto-speed="200" to adjust the sub menu slide up/down speed -->
    <div class="page-sidebar navbar-collapse collapse">
        <!-- BEGIN SIDEBAR MENU -->
        <ul class="page-sidebar-menu" data-auto-scroll="true" data-slide-speed="200">
            <!-- DOC: To remove the sidebar toggler from the sidebar you just need to completely remove the below "sidebar-toggler-wrapper" LI element -->
            <li class="sidebar-toggler-wrapper">
                <!-- BEGIN SIDEBAR TOGGLER BUTTON -->
                <div class="sidebar-toggler">
                </div>
                <!--                 END SIDEBAR TOGGLER BUTTON -->
            </li>
            <li class="start">
                <a href="{{route("dashboard")}}">
                    <i class="icon-home"></i>
                    <span class="title">Dashboard</span>
                    <span class="arrow "></span>
                </a>
            </li>
            
            <li style="display:block;">
                <a href="javascript:;">
                    <i class="icon-flag"></i>
                    <span class="title">Clients</span>
                    <span class="arrow "></span>
                </a>                
                <ul class="sub-menu">                    
                    <li>
                        <a href="{{route("getAllClients")}}">
                            View All Clients</a>
                    </li>
                    <li>
                        <a href="{{route("addClient")}}">
                            Add Client</a>
                    </li>                    
                    <li>
                        <a href="{{route("sortClients")}}">
                            Sort Clients</a>
                    </li>                    
                </ul>                
            </li>
            <li style="display:block;">
                <a href="javascript:;">
                    <i class="icon-flag"></i>
                    <span class="title">Partners</span>
                    <span class="arrow "></span>
                </a>                
                <ul class="sub-menu">                    
                    <li>
                        <a href="{{route("getAllPartners")}}">
                            View All Partners</a>
                    </li>
                    <li>
                        <a href="{{route("addPartner")}}">
                            Add Partner</a>
                    </li>                    
                    <li>
                        <a href="{{route("sortPartners")}}">
                            Sort Partners</a>
                    </li>                    
                </ul>                
            </li>
            <li style="display:block;">
                <a href="javascript:;">
                    <i class="icon-flag"></i>
                    <span class="title">Branches</span>
                    <span class="arrow "></span>
                </a>                
                <ul class="sub-menu">                    
                    <li>
                        <a href="{{route("getAllBranches")}}">
                            View All Branches</a>
                    </li>
                    <li>
                        <a href="{{route("addBranch")}}">
                            Add Branch</a>
                    </li>                    
                    <li>
                        <a href="{{route("sortBranches")}}">
                            Sort Branches</a>
                    </li>                    
                </ul>                
            </li>
             <li style="display:block;">
                <a href="javascript:;">
                    <i class="icon-flag"></i>
                    <span class="title">Home Page Banners</span>
                    <span class="arrow "></span>
                </a>                
                <ul class="sub-menu">                    
                    <li>
                        <a href="{{route("getAllBanners")}}">
                            View All Banners</a>
                    </li>
                    <li>
                        <a href="{{route("addBanner")}}">
                            Add Banner</a>
                    </li>                    
                    <li>
                        <a href="{{route("sortBanners")}}">
                            Sort Banners</a>
                    </li>                    
                </ul>                
            </li>
             <li style="display:block;">
                <a href="javascript:;">
                    <i class="icon-flag"></i>
                    <span class="title">Pages</span>
                    <span class="arrow "></span>
                </a>                
                <ul class="sub-menu">                    
                    <li>
                        <a href="{{route("getAllPages")}}">
                            View All Pages</a>
                    </li>                                      
                </ul>                
            </li>


    </div>
</div>