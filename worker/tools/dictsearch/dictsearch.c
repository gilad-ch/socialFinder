#include <C:\Users\dror\AppData\Local\Programs\Python\Python313\include\Python.h>

static void print_py_list(PyListObject* list);
static int is_in_list(PyListObject* list, PyObject* value);
static PyDictObject* search_multiple_keys_rec(PyDictObject* dict, Py_ssize_t pos, PyListObject* keys, PyDictObject* keysDict, Py_ssize_t keys_size, PyListObject* ignoreKeys);
static PyObject* search_multiple_keys(PyObject* self, PyObject* args);
static PyObject* search_one_key_rec(PyDictObject* dict, Py_ssize_t pos, PyObject* search_key);
static PyObject* search_one_key(PyObject* self, PyObject* args);

static PyObject* search_one_key_rec(PyDictObject* dict, Py_ssize_t pos, PyObject* search_key){
    PyObject *key, *value;
    while(PyDict_Next(dict, &pos, &key, &value)){
        if(PyObject_RichCompareBool(search_key, key, Py_EQ)) return value;
        else if (PyDict_Check(value)){
            PyObject* result = search_one_key_rec(value, 0, search_key);
            if (!Py_IsNone(result)) return result;
        }
    }
    Py_RETURN_NONE;
}

static PyObject* search_multiple_keys(PyObject* self, PyObject* args){
    PyDictObject *dict, *keysDict = PyDict_New();
    PyListObject  *keys, *ignoreKeys = PyList_New(0);
    
    if (!PyArg_ParseTuple(args, "OO|O", &dict, &keys, &ignoreKeys)) {
        return NULL;  // Error parsing arguments
    }

    Py_ssize_t pos = 0, keys_left = PyList_GET_SIZE(keys);
    return search_multiple_keys_rec(dict, 0, keys, keysDict, keys_left, ignoreKeys);
}

static void print_py_list(PyListObject* list){
    PyObject* iterator = PyObject_GetIter(list);
    PyObject* value;
    while(value = PyIter_Next(iterator)){
        value = PyObject_Str(value);
        printf("%s, ", PyUnicode_AsUTF8(value));
    }
    printf("\n");
}

static PyDictObject* search_multiple_keys_rec(PyDictObject* dict, Py_ssize_t pos, PyListObject* keys, PyDictObject* keysDict, Py_ssize_t keys_size, PyListObject* ignoreKeys){
    PyObject *key, *value;

    while(PyDict_Next(dict, &pos, &key, &value)){
        // print key
        // PyObject* key_str = PyObject_Str(key);
        // printf("key: %s; keys left: %lld; keys: %lld; dict keys: %lld\n", PyUnicode_AsUTF8(key_str), keys_size, PyObject_Size(keys), PyDict_Size(keysDict));
        if(keys_size == PyDict_Size(keysDict)) return keysDict;
        if(is_in_list(keys, key)) PyDict_SetItem(keysDict, key, value);
        else if(PyDict_Check(value) && !is_in_list(ignoreKeys, key)) search_multiple_keys_rec(value, 0, keys, keysDict, keys_size, ignoreKeys);
    }
    return keysDict;
}

static int is_in_list(PyListObject* list, PyObject* value){
    if(!PyList_Size(list)) return 0;

    PyObject* iterator = PyObject_GetIter(list);
    PyObject* item;
    
    while(item = PyIter_Next(iterator)) if(PyObject_RichCompareBool(item, value, Py_EQ)) return 1;
        
    return 0;
}

static PyObject* search_one_key(PyObject* self, PyObject* args){
    PyObject *key;
    PyDictObject *dict;
    PyListObject *ignoreKeys;

    if (!PyArg_ParseTuple(args, "OO|O", &dict, &key, &ignoreKeys)) {
        return NULL;  // Error parsing arguments
    }
   
    return search_one_key_rec(dict, 0, key);
}
// Define methods for the module
static PyMethodDef MyMethods[] = {
    {"search_multiple_keys", search_multiple_keys, METH_VARARGS, "Search multiple keys in a dictionary"},
    {"search_one_key"      , search_one_key      , METH_VARARGS, "Search one key in a dictionary"      },
    {NULL                  , NULL                , 0           , NULL                                  }                           
};

// Define the module
static struct PyModuleDef dictsearch = {
    PyModuleDef_HEAD_INIT,
    "dictsearch",   // Module name
    "Dictionary search tool", // Docstring
    -1,            // Size of per-interpreter state of the module (or -1)
    MyMethods      // The methods of the module
};

// Initialize the module
PyMODINIT_FUNC PyInit_dictsearch(void) {
    return PyModule_Create(&dictsearch);
}
