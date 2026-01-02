from setuptools import setup, find_packages

setup(
    name="helm_analytics",
    version="1.1.0",
    description="Official Python Middleware for Helm Analytics",
    long_description=open("README.md").read() if open("README.md").read() else "",
    long_description_content_type="text/markdown",
    author="Helm Analytics",
    author_email="support@helm-analytics.com",
    url="https://github.com/Sentinel-Analytics/sentinel-mvp/tree/master/sdk/python",
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0"
    ],
    extras_require={
        "fastapi": ["fastapi", "uvicorn"],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: Apache Software License",
        "Operating System :: OS Independent",
        "Framework :: FastAPI",
        "Framework :: Flask",
        "Framework :: Django",
    ],
    python_requires='>=3.6',
)
