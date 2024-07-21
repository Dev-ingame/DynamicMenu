import { world, Player, ItemStack, system } from "@minecraft/server";
import { ActionFormData, ModalFormData } from "@minecraft/server-ui";

const MenuItem = "minecraft:heart_of_the_sea";

let DefaultButtonData = {
    name: "give bread",
    value: "give @s bread",
};

const loadData = () => {
    try {
        const MenuData = JSON.parse(world.getDynamicProperty("key"));
        return { name: MenuData.name, value: MenuData.value, data: MenuData };
    } catch (error) {
        setData(DefaultButtonData);
    }
};

const setData = (value) => {
    console.warn(JSON.stringify(value));

    world.setDynamicProperty("key", JSON.stringify(value));
};

const format = (value) => {
    return value.replace(/'/g, "\\'");
};

/**
 *
 * @param {Player} source
 */
const runCommand = (source) => {
    let { value } = loadData();

    source.runCommand(value);
};

world.afterEvents.worldInitialize.subscribe((ev) => {
    if (loadData().name == "" || undefined || null) {
        console.warn("loaded");
        return setData(DefaultButtonData);
    }
});

const CommandEditorUi = (source) => {
    const { name, value } = loadData();
    new ModalFormData()
        .title("Dynamic Menu Editor")
        .textField("name:", name)
        .textField("command:", value)
        .show(source)
        .then((submit) => {
            console.warn(submit.formValues);

            if (submit && !submit.canceled) {
                setData({
                    name: format(submit.formValues[0]) || name,
                    value: format(submit.formValues[1]) || value,
                });
            }
        });
};

const CommonUi = (source) => {
    const { name, value } = loadData();
    console.warn(name);

    new ActionFormData()
        .title("Dynamic Menu Common")
        .button(name)
        .show(source)
        .then((response) => {
            return runCommand(source);
        });
};

const AdminnUi = (source) => {
    const { name, value } = loadData();
    new ActionFormData()

        .title("Dynamic Menu Admin")
        .button(name)
        .button("Edit Button")
        .button("Default")
        .show(source)
        .then((submit) => {
            switch (submit.selection) {
                case 0:
                    return runCommand(source);

                    break;
                case 1:
                    CommandEditorUi(source);
                    break;
                case 2:
                    setData(DefaultButtonData);
                    break;

                default:
                    break;
            }
        });
};

/**
 *
 * @param {Player} source
 */

const mainUi = (source) => {
    if (source.hasTag("MenuAdmin")) return AdminnUi(source);
    else {
        return CommonUi(source);
    }
};

world.afterEvents.itemUse.subscribe((ev) => {
    const item = ev.itemStack;
    const entity = ev.source;

    if (item.typeId == MenuItem) mainUi(entity);
});
