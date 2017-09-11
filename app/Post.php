<?php

namespace App;
use DB;
use Corcel\Model\Post as Corcel;
use Illuminate\Database\Eloquent\Model as Eloquent;
class Post extends Corcel
{
    protected $connection = 'wordpress';
    
     public function taxonomy() {
        return $this->belongsTo('App\Taxonomy');
    }
     /**
     * getPostBySlug method for creating new entry
     *
     * @param  '$data'
     * @return model function that perform the database functions for new entry
     */
    public static function getAllChannels() {
        $res = [];
       $data = Taxonomy::where('taxonomy', 'category')->with('posts')->get();      
       $data = collect($data)->map(function($x){ return (array) $x; })->toArray(); 
echo '<pre>';
var_dump($data);
die;
       foreach ($data as $key => $value) {
           echo '<pre>';
       var_dump((array)$value['relations']['posts']);
       die;
       }
      
       return (!empty($data)) ? $data->toArray() : array();
    }
     /**
     * getTips method for creating new entry
     *
     * @param  '$data'
     * @return model function that perform the database functions for new entry
     */
    public static function getPostBySlug($slug) {
       $data = Post::type('page')->slug($slug)->first();
       return (!empty($data)) ? $data->toArray() : array();
    }
}
