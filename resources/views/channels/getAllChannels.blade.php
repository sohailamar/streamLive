@extends("layouts/main_layout")
@section('content')
<div class="left-content">
    <div class="searchbar">
        <div class="search-left">
            <p>Latest Video Form VideosTube</p>
        </div>
        <div class="search-right">
            <form>
                <input type="text"><input type="submit" value="" />
            </form>
        </div>
        <div class="clear"> </div>
    </div>
    <div class="box">
        <div class="grids">
            @if(!empty($channels))
            @foreach($channels as $key=>$channel)            
            <div class="grid">
                <h3>{{$channel['title']}}</h3>
                <a href="{{url('/channels',['id'=>$channel['id']])}}"><img src="{{url('/')}}/storage/app/public/{{$channel['image']}}" title="video-name" /></a>
                <div class="time">
                    <span>00:10</span>
                </div>
                <div class="grid-info">
                    <div class="video-share">
                        <ul>
                            <li><a href="#"><img src="{{asset('images') }}/likes.png" title="links" /></a></li>
                            <li><a href="#"><img src="{{asset('images') }}/link.png" title="Link" /></a></li>
                            <li><a href="#"><img src="{{asset('images') }}/views.png" title="Views" /></a></li>
                        </ul>
                    </div>
                    <div class="video-watch">
                        <a href="single.html">Watch Now</a>
                    </div>
                    <div class="clear"> </div>
                    <div class="lables">
                        <p>Labels:<a href="categories.html">Lorem</a></p>
                    </div>
                </div>
            </div>              
            @endforeach
            @endif
        </div>
        <div class="clear"> </div>        
    </div>
    <div class="clear"> </div>    
</div>
<div class="right-content">
    <div class="popular">
        <h3>Popular Videos</h3>
        <p><img src="images/l1.png" title="likes" /> 10,000</p>
        <div class="clear"> </div>
    </div>
    <div class="grid1">
        <h3>Consectetur adipisicing elit</h3>
        <a href="#"><img src="{{asset('images') }}/g7.jpg" title="video-name" /></a>
        <div class="time1">
            <span>2:50</span>
        </div>

        <div class="grid-info">
            <div class="video-share">
                <ul>
                    <li><a href="#"><img src="{{asset('images') }}/likes.png" title="links" /></a></li>
                    <li><a href="#"><img src="{{asset('images') }}/link.png" title="Link" /></a></li>
                    <li><a href="#"><img src="{{asset('images') }}/views.png" title="Views" /></a></li>
                </ul>
            </div>
            <div class="video-watch">
                <a href="#">Watch Now</a>
            </div>
            <div class="clear"> </div>
            <div class="lables">
                <p>Labels:<a href="#">Lorem</a></p>
            </div>
        </div>
    </div>
    <div class="clear"> </div>
    <div class="Recent-Vodeos">
        <h3>Recent-Videos</h3>
        <div class="video1">
            <img src="{{asset('images') }}/r1.jpg" title="video2" />
            <span>Lorem ipsum dolor sit amet,</span>
            <p>s consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </p>
            <div class="clear"> </div>
        </div>
        <div class="video1 video2">
            <img src="{{asset('images') }}/r2.jpg" title="video2" />
            <span>Lorem ipsum dolor sit amet,</span>
            <p>s consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </p>
            <div class="clear"> </div>
        </div>
        <div class="r-all">
            <a href="#">View All</a>
        </div>
    </div>
</div>

@endsection