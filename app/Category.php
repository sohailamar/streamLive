<?php

namespace App;

use DB;
use Illuminate\Database\Eloquent\Model as Eloquent;
use Corcel\Model\Post as Corcel;

class Term extends Corcel {

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $connection = 'wordpress';    
     
    /*
      |--------------------------------------------------------------------------
      | Model Relations methods for different tables
      |--------------------------------------------------------------------------
      |
     */

}
