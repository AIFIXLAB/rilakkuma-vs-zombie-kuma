import json,os,shutil
from PIL import Image
W='/home/claude/work'; G='/home/claude/game'; A=f'{G}/Assets'
names=dict(json.load(open(f'{W}/names.json')))
shutil.rmtree(A,ignore_errors=True)
M=[]
def put(src,folder,fname,aid,name,typ,role='',direction='',status='assigned',note='',maxdim=320,sheet=None):
    os.makedirs(f'{A}/{folder}',exist_ok=True)
    im=Image.open(src).convert('RGBA'); 
    if maxdim and max(im.size)>maxdim:
        s=maxdim/max(im.size); im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
    im.save(f'{A}/{folder}/{fname}',optimize=True)
    M.append(dict(id=aid,name=name,type=typ,role=role,file=f'Assets/{folder}/{fname}',w=im.width,h=im.height,
                  direction=direction,status=status,source=names.get(sheet or os.path.basename(src)[:3],''),note=note))
def bg(sid,folder,fname,aid,name,typ,status='assigned',note=''):
    os.makedirs(f'{A}/{folder}',exist_ok=True)
    im=Image.open(f'{W}/src/{sid}.png').convert('RGB'); im.save(f'{A}/{folder}/{fname}',quality=86,optimize=True)
    M.append(dict(id=aid,name=name,type=typ,role='',file=f'Assets/{folder}/{fname}',w=im.width,h=im.height,direction='',status=status,source=names[sid],note=note))
S=f'{W}/sliced'
# Defenders
for k,(aid,n,r) in enumerate([('DEF_POT_SHIELD','Pot Shield Kuma','Tank'),('DEF_SPRAY','Spray Kuma','Defensive Support'),
    ('DEF_CARDBOARD','Cardboard Kiiroitori','Heavy Defender'),('DEF_FAN','Fan Korilakkuma','Knockback Defender'),
    ('DEF_MOP_CAT','Mop Cat','Control Defender'),('DEF_LAUNDRY_PANDA','Laundry Panda','Heavy Shield')]):
    put(f'{S}/a12_{k:02d}.png','Characters/Defenders',aid.lower()+'.png',aid,n,'Defender',r,'Right',
        note='Art shows a penguin holding a fan; name kept from design doc' if aid=='DEF_FAN' else '')
# Attackers - donut shooters (pixel)
att=[('ATK_DONUT_KUMA','Donut Kuma','Donut Shooter'),('ATK_DONUT_KORI','Donut Korilakkuma','Donut Shooter'),
     ('ATK_LADLE_TORI','Ladle Kiiroitori','Rapid Attacker'),('ATK_ROLLINGPIN_CHEF','Rolling Pin Chef','Heavy Attacker'),
     ('ATK_DONUT_CANNON','Donut Cannon Kuma','Heavy Attacker'),('ATK_GOGGLE_CAT','Goggle Cat Blaster','Rapid Attacker'),
     ('ATK_UMBRELLA_PANDA','Umbrella Panda','Projectile Shooter'),('ATK_CHOCO_KUMA','Choco Kuma','Magic Attacker')]
for k,(aid,n,r) in enumerate(att):
    put(f'{S}/a26_{11+k:02d}.png','Characters/Attackers',aid.lower()+'.png',aid,n,'Attacker',r,'Right')
# Attackers for Phase 2 (assigned to category, stats not yet tuned)
for sheet,cnt,pre,label in [('a28',8,'ATK_HOUSEWORK','Housework Assault Squad'),('a01',8,'ATK_KITCHEN','Kitchen Army (pixel)'),('a13',6,'ATK_ANIMAL','Animal Housework Warriors')]:
    for k in range(cnt):
        put(f'{S}/{sheet}_{k:02d}.png','Characters/Attackers',f'{pre.lower()}_{k+1:02d}.png',f'{pre}_{k+1:02d}',f'{label} #{k+1}','Attacker','TBD (Phase 2)','Right',status='assigned-phase2')
# Zombies
zm=[('ZOM_NORMAL','Normal Zombie Kuma','Melee'),('ZOM_CONE','Cone Zombie Kuma','Armor'),('ZOM_BUCKET','Bucket Zombie Kuma','Armor/Shield'),
    ('ZOM_NURSE','Nurse Zombie Kuma','Fast'),('ZOM_MINER','Miner Zombie Kuma','Melee (Phase 2)'),('ZOM_CHEF_MELEE','Spatula Chef Zombie','Melee (Phase 2)'),
    ('ZOM_HEAVY','Heavy Zombie Kuma','Tank'),('ZOM_GHOST','Ghost Kuma','Special (Town 2)')]
for k,(aid,n,r) in enumerate(zm):
    put(f'{S}/a21_{k:02d}.png','Zombies',aid.lower()+'.png',aid,n,'Zombie',r,'Left')
rz=[('RZ_ROCK','Rock Zombie'),('RZ_BUILDER','Builder Zombie'),('RZ_CHEF','Chef Zombie'),('RZ_FARMER','Farmer Zombie'),('RZ_TRASH','Trash Zombie'),('RZ_TOXIC','Toxic Zombie')]
pj=['rock','brick','egg','tomato','can','poison_bottle']
for k,(aid,n) in enumerate(rz):
    put(f'{S}/rz_{k}.png','RangedZombies',aid.lower()+'.png',aid,n,'Ranged Zombie','Ranged','Left',sheet='a18')
    put(f'{S}/proj_{k}.png','Projectiles',f'proj_{pj[k]}.png','PROJ_'+pj[k].upper(),pj[k].replace('_',' ').title(),'Projectile','Zombie projectile','Left',sheet='a18',maxdim=128)
bs=[('BOSS_GIANT_ZOMBIE_KUMA','Giant Zombie Kuma','Town 1 Boss','assigned'),('BOSS_SPIKE_ARMOR','Spiked Armor Zombie','candidate Mini Boss','unassigned'),
    ('BOSS_TANK','Tank Zombie Kuma','candidate Mini Boss','unassigned'),('BOSS_TENTACLE','Tentacle Zombie','candidate Boss','unassigned'),
    ('BOSS_TOXIC_SLIME','Toxic Slime Zombie','candidate Boss (Town 4?)','unassigned'),('BOSS_FINAL_KING','Final King Zombie Kuma (candidate)','Town 8 Boss candidate','unassigned')]
for k,(aid,n,r,st) in enumerate(bs):
    put(f'{S}/boss_{k}.png','Bosses',aid.lower()+'.png',aid,n,'Boss',r,'Front/Left',status=st,sheet='a02',maxdim=420)
# extra zombie sheets -> Unassigned pool (listed for user review)
for k in range(36): put(f'{S}/a02_{k:02d}.png','Unassigned/ZombiePixel',f'zombie_pixel_{k+1:02d}.png',f'UNA_ZPIX_{k+1:02d}','Pixel zombie #'+str(k+1),'Zombie','?','Front',status='unassigned',sheet='a02')
for k in range(48): put(f'{S}/a06_{k:02d}.png','Unassigned/Zombie48',f'zombie48_{k+1:02d}.png',f'UNA_Z48_{k+1:02d}','Zombie variant #'+str(k+1),'Zombie','?','Front',status='unassigned',sheet='a06')
for k,n in enumerate(['Pirate','Samurai','Wizard','Scientist','Mummy','Devil','Pumpkin','Plague Doctor']):
    put(f'{S}/a03_{k:02d}.png','Zombies/Themed',f'zombie_{n.lower().replace(" ","_")}.png',f'ZOM_{n.upper().replace(" ","_")}',n+' Zombie','Zombie','Themed (later towns)','Left',status='assigned-phase3')
# Traps (10 from doc mapped; rest unassigned)
trapmap={9:'TRAP_BUG_SWATTER',2:'TRAP_FRYING_PAN',3:'TRAP_WATER_BUCKET',4:'TRAP_NET',18:'TRAP_ELECTRIC_FAN',6:'TRAP_SPIKE',8:'TRAP_STICKY_GLUE',26:'TRAP_ROLLING_PIN_CANDIDATE',21:'TRAP_SPRING'}
for k in range(48):
    p=f'{S}/a10_{k:02d}.png'
    if not os.path.exists(p): continue
    if k in trapmap: put(p,'Traps',trapmap[k].lower()+'.png',trapmap[k],trapmap[k][5:].replace('_',' ').title(),'Trap','','Front',status='assigned-phase2',sheet='a10')
    else: put(p,'Unassigned/Traps',f'trap_{k+1:02d}.png',f'UNA_TRAP_{k+1:02d}',f'Trap #{k+1}','Trap','?','Front',status='unassigned',sheet='a10')
# Factory
for lv,k in [(1,4),(2,1),(3,2),(4,3),(5,0)]:
    put(f'{S}/a26_{k:02d}.png','Factories',f'factory_lv{lv}.png',f'FACTORY_LV{lv}',f'Donut Factory Lv.{lv}','Factory','Producer','Front',sheet='a26',
        note='Lv.5 uses the large showcase illustration' if lv==5 else 'includes painted Lv label')
for i,(k,st) in enumerate([(5,'idle'),(6,'heating'),(7,'baking'),(8,'eject')]):
    put(f'{S}/a26_{k:02d}.png','Factories',f'factory_anim_{i+1}_{st}.png',f'FACTORY_ANIM_{st.upper()}',f'Factory frame: {st}','Factory Animation','','Front',sheet='a26')
put(f'{S}/a26_09.png','Effects','fx_sparkle_yellow.png','FX_SPARKLE','Sparkle burst','Effect','','',sheet='a26')
put(f'{S}/a26_10.png','Unassigned/Factory','donut_evolution_panel.png','UNA_DONUT_PANEL','Donut evolution panel','UI/Info','?','',status='unassigned',sheet='a26')
put(f'{S}/donut_item.png','Donuts','donut_normal.png','DONUT_NORMAL','Normal Donut','Donut','Resource','',sheet='a26',maxdim=0)
# UI icons
ui={'01':'icon_play','36':'icon_settings','57':'icon_coin','63':'icon_hourglass','124':'icon_heart','127':'icon_lock','142':'icon_star','140':'icon_star_bronze','49':'icon_check','50':'icon_close',
    '113':'icon_arrow_left','114':'icon_arrow_right','125':'icon_refresh','69':'icon_swords','67':'icon_shield','59':'icon_bomb','00':'icon_home','02':'icon_map','03':'icon_character','07':'icon_upgrade',
    '08':'icon_shop','09':'icon_gacha','11':'icon_event','13':'icon_mission','14':'icon_achievement','19':'icon_collection','20':'icon_crown','81':'icon_exp','61':'icon_clock','47':'icon_help_info','46':'icon_alert',
    '131':'card_frame_kuma','132':'card_frame_kori','149':'card_frame_empty','106':'panel_dialog','109':'ribbon_yellow','134':'ribbon_blue','148':'ribbon_pink','141':'ribbon_red','135':'bar_green','152':'bar_yellow','153':'bar_blue','154':'bar_purple',
    '107':'bubble_white','108':'bubble_cream','110':'burst_white','115':'toggle_on','116':'toggle_off','137':'checkbox_empty','136':'checkbox_checked',
    '120':'fx_loading_dots','121':'fx_star_glow','122':'fx_twinkle','128':'fx_hit_splat','126':'fx_cloud','118':'fx_burst_lines'}
for k,n in ui.items():
    p=f'{S}/a04_{k}.png'
    put(p,'UI/Icons' if n.startswith('icon') else ('Effects' if n.startswith('fx') else 'UI'),n+'.png','UI_'+n.upper(),n.replace('_',' '),'UI','','',sheet='a04',maxdim=256)
for n in ['start','receive','go','upgrade','buy','cancel']:
    put(f'{S}/btn_{n}.png','UI/Buttons',f'btn_{n}.png','BTN_'+n.upper(),'Button '+n,'Button','','',sheet='a04',maxdim=0)
# Full-screen
for sid,fold,fn,aid,n,t in [('a29','Maps','town1_rilakkuma_board.jpg','MAP_TOWN1','Town 1 Rilakkuma Town battlefield','Battlefield'),
  ('a34','Maps','town2_sakura_board.jpg','MAP_TOWN2','Town 2 Sakura battlefield','Battlefield'),
  ('a31','Maps','town3_seaside_board.jpg','MAP_TOWN3','Town 3 Seaside battlefield','Battlefield'),
  ('a35','Maps','town4_forest_board.jpg','MAP_TOWN4','Town 4 Forest battlefield','Battlefield'),
  ('a37','Maps','town5_snow_board.jpg','MAP_TOWN5','Town 5 Snow battlefield','Battlefield'),
  ('a32','Maps','town6_desert_board.jpg','MAP_TOWN6','Town 6 Desert battlefield','Battlefield'),
  ('a30','Maps','town7_volcano_board.jpg','MAP_TOWN7','Town 7 Volcano battlefield','Battlefield'),
  ('a36','Maps','town8_sky_board.jpg','MAP_TOWN8','Town 8 Sky Castle battlefield','Battlefield'),
  ('a27','Maps','coop_10row_board.jpg','MAP_COOP10','CO-OP battlefield (title says ten rows)','Battlefield'),
  ('a14','Backgrounds','title_screen.jpg','BG_TITLE','Title screen (baked buttons)','Screen'),
  ('a08','Backgrounds','lobby_main_menu.jpg','BG_LOBBY','Main menu lobby (baked buttons)','Screen'),
  ('a33','Backgrounds','select_town.jpg','BG_SELECT_TOWN','Select Town screen','Screen'),
  ('a16','Backgrounds','mission_screen.jpg','BG_MISSION','Mission screen mockup','Screen'),
  ('a17','Backgrounds','daily_login.jpg','BG_DAILY_LOGIN','Daily Login screen mockup','Screen'),
  ('a09','Backgrounds','vs_mode.jpg','BG_VS','VS Mode screen mockup','Screen'),
  ('a07','Cutscenes','story_intro_comic.jpg','CUT_INTRO','Story intro comic + first mission','Cutscene'),
  ('a25','Cutscenes','donut_comic.jpg','CUT_DONUT','Donut comic (4 panels)','Cutscene'),
  ('a19','Cutscenes','blood_moon.jpg','CUT_BLOODMOON','Blood moon horde scene','Cutscene')]:
    bg(sid,fold,fn,aid,n,t)
for sid,n in [('a05','Night cafe board (stone, 9x5?)'),('a11','Night pixel board'),('a20','Autumn farm board'),('a22','Seaside board alt'),('a23','Backyard board'),('a24','Neon city board'),('a15','Select Town screen (duplicate of townmap copy)')]:
    bg(sid,'Unassigned/Boards',f'{sid}_{n.split()[0].lower()}.jpg','UNA_'+sid.upper(),n,'Battlefield','unassigned','Extra board/alt — choose which town or event uses it')
json.dump(M,open(f'{G}/Assets/asset_manifest.json','w'),ensure_ascii=False,indent=1)
print(len(M))
