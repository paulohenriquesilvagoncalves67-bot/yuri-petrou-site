import {config} from '@/data/site';export default function robots(){return {rules:{userAgent:'*',...(config.demo?{disallow:'/'}:{allow:'/'})},sitemap:config.origin+'/sitemap.xml'}}
