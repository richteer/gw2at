import requests, json

apibase = "https://api.guildwars2.com"

with open("tier_rewards_table.json", "r") as f:
    data = json.loads(f.read())

# id -> blob
itemmap = {}
for item in data.values():
    for i in item:
        itemmap[i] = {}

r = requests.get(apibase + f"/v2/items?ids={','.join(itemmap.keys())}")

for item in r.json():
    itemmap[item["id"]] = item

with open("item_data.json", "w") as f:
    f.write(json.dumps(itemmap, indent=2))