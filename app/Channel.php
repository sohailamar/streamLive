<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Channel extends Model
{
    use SoftDeletes;

    /**
     * The attributes that should be mutated to dates.
     *
     * @var array
     */
    protected $dates = ['deleted_at'];
    
     /**
     * getAllChannels method for creating new entry
     *
     * @param  '$data'
     * @return model function that perform the database functions for new entry
     */
    public static function getAllChannels() {        
       $data = Channel::get();                     
       return (!empty($data)) ? $data->toArray() : array();
    }
     /**
     * getAllChannels method for creating new entry
     *
     * @param  '$data'
     * @return model function that perform the database functions for new entry
     */
    public static function getChannelDetail() {        
       $data = Channel::get();                     
       return (!empty($data)) ? $data->toArray() : array();
    }
    
}
