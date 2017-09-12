<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;

use App\Http\Requests;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Input;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Redirect;
use Validator;
use App\Channel;
class ChannelController extends \App\Http\Controllers\Controller
{
        
    /**
     * function index
     * 
     * Main welcome page for site that shows all the content
     * 
     * @param type empty
     * 
     * @return View for home page
     * @author Sohail Amar Aftab <sohailamar09@gmail.com>
     */
    public function getAllChannels() {    
       $channels = Channel::getAllChannels();         
        return view('channels/getAllChannels', compact("channels"));
    }
    /**
     * function index
     * 
     * Main welcome page for site that shows all the content
     * 
     * @param type empty
     * 
     * @return View for home page
     * @author Sohail Amar Aftab <sohailamar09@gmail.com>
     */
    public function getChannelDetail($id) {    
       $channel = Channel::getChannelDetail($id);       
        return view('channels/getChannelDetail', compact("channel"));
    }
   
}