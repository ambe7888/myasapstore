<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    protected $fillable = ['store_id', 'theme', 'content'];
    protected $casts = ['content' => 'array'];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public static function getSettings($storeId, $theme = 'default')
    {
        $themeDefaults = self::getThemeDefaults($theme);
        
        $settings = self::where('store_id', $storeId)
                       ->where('theme', $theme)
                       ->first();
        
        if (!$settings) {
            // Return theme defaults as dynamic content
            return $themeDefaults;
        }
        
        $mergedSettings = self::mergeSettings($themeDefaults, $settings->content);
        
        // Special handling for social_links - don't merge with defaults if user has custom settings
        if (isset($settings->content['footer']['social_links'])) {
            $mergedSettings['footer']['social_links'] = $settings->content['footer']['social_links'];
        }
        
        return $mergedSettings;
    }
    
    private static function mergeSettings($defaults, $custom)
    {
        if (!is_array($defaults) || !is_array($custom)) {
            return $custom;
        }

        // If one of them is a list (sequential array), completely replace it
        $isListDefaults = empty($defaults) || (array_keys($defaults) === range(0, count($defaults) - 1));
        $isListCustom = empty($custom) || (array_keys($custom) === range(0, count($custom) - 1));
        
        if ($isListDefaults || $isListCustom) {
            return $custom;
        }

        $merged = $defaults;
        foreach ($custom as $key => $value) {
            if (array_key_exists($key, $defaults) && is_array($defaults[$key]) && is_array($value)) {
                $merged[$key] = self::mergeSettings($defaults[$key], $value);
            } else {
                $merged[$key] = $value;
            }
        }

        return $merged;
    }
    
    public static function updateSettings($storeId, $theme, $content)
    {
        return self::updateOrCreate(
            ['store_id' => $storeId, 'theme' => $theme],
            ['content' => $content]
        );
    }
    
    private static function getThemeDefaults($theme)
    {
        $filePath = resource_path("js/themes/{$theme}.json");
        
        if (!file_exists($filePath)) {
            $filePath = resource_path("js/themes/default.json");
        }
        
        $themeData = json_decode(file_get_contents($filePath), true);
        
        // Extract values from new structure
        return self::extractValues($themeData);
    }
    
    private static function extractValues($data)
    {
        if (is_array($data)) {
            $result = [];
            foreach ($data as $key => $value) {
                if (is_array($value) && isset($value['value'])) {
                    $result[$key] = self::extractValues($value['value']);
                } else {
                    $result[$key] = self::extractValues($value);
                }
            }
            return $result;
        }
        
        return $data;
    }
    
    private static function getDefaultContent()
    {
        // Fallback method - now uses JSON files instead
        return self::getThemeDefaults('default');
    }
}