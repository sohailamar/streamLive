
<div class="header">
    <!----start-Logo---->
    <div class="logo">
        <a href="index.html"><img src="{{asset('images') }}/logo.png" title="logo" /></a>
    </div>
    <!----End-Logo---->
    <!----start-top-nav---->
    <div class="top-nav">
        <ul>
            <li><a href="{{url('/')}}">Home</a><p>My Forntpage</p></li>
            <li><a href="{{url('/channels')}}">Channels</a><p></p></li>
            <li><a href="categories.html">Categories</a><p>Be Ur Self</p></li>
            <li><a href="#">Economics</a><p>Human Needs</p></li>
            <li><a href="#">Health</a><p>Take A Trip</p></li>
            <li><a href="#">Contact</a><p>Leave Messages</p></li>
        </ul>
    </div>
    <div class="clear"> </div>
    <!----End-top-nav---->
</div>
<!----End-Header---->
<div class="clear"> </div>        
<?php
if (Session::has('message')) {
    echo CommonHelper::generateHtmlAlert(Session::get('message'));
}
?>  
<script>
    var site_url = '<?php echo url('/'); ?>/';
    // var site_url='/~gbmapp/';
</script>

