from setuptools import setup, Extension

module = Extension('dictsearch', sources=['dictsearch.c'])

setup(
    name='dictsearch',
    version='1.0',
    description='Dictionary search tool',
    ext_modules=[module],
)
