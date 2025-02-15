Oskari.registerLocalization(
{
    "lang": "en",
    "key": "MyPlaces3",
    "value": {
        "title": "Places",
        "desc": "",
        "guest": {
            "loginShort": "Log in to add your own places on a map."
        },
        "tab": {
            "title": "Places",
            "nocategories": "You do not have any saved places yet.",
            "maxFeaturesExceeded": "You have too many own places. Please remove some places.",
            "publishCategory": {
                "privateTooltip": "This map layer is private. Click here to publish it.",
                "publicTooltip": "This map layer is public. Click here to unpublish it."
            },
            "export": {
                "title":"Export features",
                "tooltip": "You can download the layer's features as GeoJSON"
            },
            "addCategoryFormButton": "New map layer",
            "addCategory": "Add map layer",
            "editCategory": "Edit map layer",
            "deleteCategory": "Delete map layer",
            "edit": "Edit",
            "delete": "Delete",
            "grid": {
                "name": "Place name",
                "desc": "Place description",
                "createDate": "Created",
                "updateDate": "Updated",
                "measurement": "Size",
                "edit": "Edit",
                "delete": "Delete"
            },
            "notification": {
                "delete": {
                    "title": "Delete Place",
                    "confirm": "Do you want to delete place \"{name}\"?",
                    "btnDelete": "Delete",
                    "btnCancel": "Cancel",
                    "success": "The place has been deleted.",
                    "error": "The place could not be deleted. Please try gain later.",
                    "cancel": "The place has not been deleted."
                }
            }
        },
        "tools": {
            "measureline": {
                "title": "Measure Distance",
                "tooltip": "Click breakpoints and measure a total distance between them.",
                "add": "Add line",
                "next": "Next",
                "edit": "Click a starting point and breaking points. Finally double-click an ending point. You can drag points to another location by mouse. If you draw several lines, distances are summed up.",
                "noResult": "0 m"
            },
            "measurearea": {
                "title": "Measure Area",
                "tooltip": "Draw an area and measure it.",
                "add": "Add area",
                "next": "Next",
                "edit": "Click corner points. Finally double-click an ending point. You can drag points to another location by mouse. If you draw several areas, areas are summed up.",
                "noResult": "0 m²"
            },
            "point": {
                "title": "Add Point",
                "tooltip": "Draw a point and add it to your own places. There can be several points in one feature.",
                "add": "Draw a point by clicking the map.",
                "next": "You can draw several points in one feature.",
                "edit": "You can move points to another location by clicking them with a mouse.",
                "save": "Save My Place"
            },
            "line": {
                "title": "Add Line to Own Places",
                "tooltip": "Draw a line and add it to your own places.",
                "add": "Draw a line to the map. Click breaking points. Finally double-click an ending point and click \"Save My Place\".",
                "next": "You can move breaking points to another location by clicking them with a mouse.",
                "edit": "You can move breaking points to another location by clicking them with a mouse.",
                "save": "Save My Place",
                "noResult": "0 m"
            },
            "area": {
                "title": "Add Area to Own Places",
                "tooltip": "Draw an area and add it to your own places.",
                "add": "Draw an area to the map. Click breaking points. Finally double-click an ending point and click \"Save My Place\".",
                "next": "You can draw several areas in one feature.",
                "edit": "You can move breaking points to another location by clicking them with a mouse.",
                "save": "Save My Place",
                "noResult": "0 m²"
            }
        },
        "buttons": {
            "ok": "OK",
            "cancel": "Cancel",
            "close": "Cancel",
            "finish": "Save My Place",
            "save": "Save",
            "saveAsMyPlace": "Save My Place",
            "movePlaces": "Move places and delete",
            "deleteCategory": "Delete",
            "deleteCategoryAndPlaces": "Delete with places",
            "changeToPublic": "Publish",
            "changeToPrivate": "Unpublish"
        },
        "placeform": {
            "title": "Place data",
            "tooltip": "Save the feature as your own place. Please give at least a name and a description. Finally select a map layer where the feature will be saved or create a new map layer. Later you can find your own places in the My Data menu.",
            "placename": {
                "placeholder": "Place name"
            },
            "placelink": {
                "placeholder": "Link to additional information"
            },
            "placedesc": {
                "placeholder": "Place description"
            },
            "placeAttention": {
                "placeholder": "Text visible on map"
            },
            "measurement": {
                "line": "Line length:",
                "area": "Area size:"
            },
            "category": {
                "label": "Map layer",
                "newLayer": "Create new layer",
                "choose": "Select layer for the place:",
                "creatingNew": "A new map layer is created using My data",
            },
            "imagelink": {
                "placeholder": "Link to feature image",
                "previewLabel": "Image preview"
            },
            "rendering": {
                "label": "Styles for places at map layer",
                "point": {
                    "tooltip": "Point"
                }
            }
        },
        "categoryform": {
            "title": "Map layer details",
            "layerName": "Name",
            "styleTitle": "Styling"
        },
        "notification": {
            "placeAdded": {
                "title": "The place has been saved.",
                "message": "You can find the place in the menu \"My data\"."
            },
            "categorySaved": {
                "title": "The map layer has been saved.",
                "message": "The map layer has been updated."
            },
            "categoryDelete": {
                "title": "Delete Map Layer",
                "deleteConfirmMove": "You are deleting the map layer \"{0}\". There {1, plural, one {is # place} other {are # places}} on the map layer. Do you want to: <br/> 1. delete the map layer and its {1, plural, one {place} other {places}} <br/> 2. move the {1, plural, one {place} other {places}} to the default map layer \"{2}\" before deleting the map layer?",
                "deleteConfirm": "Do you want to delete the map layer \"{0}\"?",
                "deleted": "The map layer has been deleted."
            },
            "categoryToPublic": {
                "title": "Publish Map Layer",
                "message": "You are publishing the map layer {0}. After that the map layer can be shared in public and embedded in another map service. Also other users can view the map layer."
            },
            "categoryToPrivate": {
                "title": "Unpublish Map Layer",
                "message": "You are unpublishing the map layer {0}. After that the map layer cannot be shared in public and embedded in another map service. Also other users cannot view the map layer anymore."
            },
            "error": {
                "addCategory": "The map layer and its places could not be saved.",
                "editCategory": "The map layer could not be saved.",
                "savePlace": "The place could not be saved.",
                "title": "Error",
                "generic": "A system error occurred.",
                "deleteCategory": "The map layer could not be deleted.",
                "deleteDefault": "The default map layer cannot be deleted."
            }
        },
        "validation": {
            "title": "The given data are invalid:",
            "placeName": "A place name is missing.",
            "categoryName": "A map layer name is missing.",
            "placeNameIllegal": "The place name contains illegal characters.",
            "descIllegal": "The place description contains illegal characters.",
            "categoryNameIllegal": "The map layer name contains illegal characters."
        }
    }
});
