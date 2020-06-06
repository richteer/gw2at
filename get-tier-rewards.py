import requests, json, re
from bs4 import BeautifulSoup


ash = [
    "Special Mission Document",
    "Ash Legion Leather Box",
    "Ash Legion Crafting Box",
    "Charr Salvage (rare)",
    "Ash Legion Venom Box",
    "Champion Jotun Loot Box",
    "Ash Legion Leather Box",
    "Ash Legion Crafting Box",
    "Charr Salvage (rare)",
    "Ash Legion Glacial Materials Box",
    "Ash Legion Special Mission Document",
    "Ash Legion Crafting Box",
    "Ash Legion Leather Box",
    "Champion Wurm Loot Box",
    "Ash Legion Venom Box",
    "Charr Salvage (rare)",
    "Ash Legion Crafting Box",
    "Ash Legion Leather Box",
    "Special Mission Document",
    "Ash Legion Reward Box",
]

blood = [
    "Special Mission Document",
    "Blood Legion Wood Box",
    "Blood Legion Crafting Box",
    "Charr Salvage (rare)",
    "Blood Legion Blood Box",
    "Champion Branded Minion Loot Box",
    "Blood Legion Wood Box",
    "Blood Legion Crafting Box",
    "Charr Salvage (rare)",
    "Blood Legion Charged Materials Box",
    "Blood Legion Special Mission Document",
    "Blood Legion Crafting Box",
    "Blood Legion Wood Box",
    "Champion Grawl Loot Box",
    "Blood Legion Blood Box",
    "Charr Salvage (rare)",
    "Blood Legion Crafting Box",
    "Blood Legion Wood Box",
    "Special Mission Document",
    "Blood Legion Reward Box",
]

flame = [
    "Special Mission Document",
    "Flame Legion Cloth Box",
    "Flame Legion Crafting Box",
    "Charr Salvage (rare)",
    "Flame Legion Dust Box",
    "Champion Ogre Loot Box",
    "Flame Legion Cloth Box",
    "Flame Legion Crafting Box",
    "Charr Salvage (rare)",
    "Flame Legion Molten Materials Box",
    "Flame Legion Special Mission Document",
    "Flame Legion Crafting Box",
    "Flame Legion Cloth Box",
    "Champion Sons of Svanir Loot Box",
    "Flame Legion Dust Box",
    "Charr Salvage (rare)",
    "Flame Legion Crafting Box",
    "Flame Legion Cloth Box",
    "Special Mission Document",
    "Flame Legion Reward Box",
]

iron = [
    "Special Mission Document",
    "Iron Legion Ore Box",
    "Iron Legion Crafting Box",
    "Charr Salvage (rare)",
    "Iron Legion Claw Box",
    "Champion Warg Loot Box",
    "Iron Legion Ore Box",
    "Iron Legion Crafting Box",
    "Charr Salvage (rare)",
    "Iron Legion Onyx Materials Box",
    "Iron Legion Special Mission Document",
    "Iron Legion Crafting Box",
    "Iron Legion Ore Box",
    "Champion Dredge Loot Box",
    "Iron Legion Claw Box",
    "Charr Salvage (rare)",
    "Iron Legion Crafting Box",
    "Iron Legion Ore Box",
    "Special Mission Document",
    "Iron Legion Reward Box",
]

pagebase = "https://wiki.guildwars2.com/wiki/"

def extract_id(body):
    soup = BeautifulSoup(body, 'html.parser')
    if not soup:
        print("could not parse")
        return

    links = list(filter(lambda x: x.string == "API", soup.findAll("a", attrs={"class":"external text"})))

    if len(links) != 1:
        print("could not find API link")
        print(soup.find("title"))
        return None
    
    m = re.search(r"ids=(\d+)", links[0].get("href"))
    
    return m.group(1) if m else None
    



def get_rewards(ls):
    ret = []
    for l in ls:
        r = requests.get(pagebase + l.replace(" ","_"))
        if not r.ok:
            print(f"failed on {l}")
            ret.append(None)
            continue
    
        ret.append(extract_id(r.text))

    return ret


rewards = {
    "ash": get_rewards(ash),
    "blood": get_rewards(blood),
    "flame": get_rewards(flame),
    "iron": get_rewards(iron)
}

with open("tier_rewards_table.json", "w") as f:
    f.write(json.dumps(rewards, indent=2))